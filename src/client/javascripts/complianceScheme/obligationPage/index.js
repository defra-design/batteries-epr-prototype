import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'
import { buildObligation } from '../obligation.js'

const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

const escape = (value) =>
  String(value).replace(/[&<>"']/g, (char) => HTML_ENTITIES[char])

const setText = (doc, selector, text) => {
  doc.querySelector(selector).textContent = text
}

const firstScheme = () => storage.listSchemes()[0]

const ensureScheme = () => {
  storage.seedDemoData()
  return firstScheme()
}

const fmt = (value) => value.toFixed(3)

export const runObligationPage = (doc = globalThis.document) => {
  const payload = readPagePayload(doc)
  const scheme = ensureScheme()
  const year = payload.compliancePeriodYear

  const quarterly = storage.listQuarterlySubmissions(scheme.id, year)
  const evidence = storage.listEvidence(scheme.id, year)
  const { rows, totals } = buildObligation({ quarterly, evidence })

  const body = doc.querySelector('[data-testid="obligation-body"]')
  body.innerHTML = rows
    .map(
      (row) =>
        `<tr class="govuk-table__row" data-testid="obligation-row-${row.category}">
          <th scope="row" class="govuk-table__header">${escape(payload.copy.categories[row.category])}</th>
          <td class="govuk-table__cell govuk-table__cell--numeric" data-testid="obligation-row-${row.category}-placed">${fmt(row.placed)}</td>
          <td class="govuk-table__cell govuk-table__cell--numeric">${row.targetPercent}%</td>
          <td class="govuk-table__cell govuk-table__cell--numeric" data-testid="obligation-row-${row.category}-obligation">${fmt(row.obligation)}</td>
          <td class="govuk-table__cell govuk-table__cell--numeric" data-testid="obligation-row-${row.category}-accepted">${fmt(row.accepted)}</td>
          <td class="govuk-table__cell govuk-table__cell--numeric" data-testid="obligation-row-${row.category}-outstanding">${fmt(row.outstanding)}</td>
        </tr>`
    )
    .join('')

  setText(doc, '[data-testid="obligation-total-placed"]', fmt(totals.placed))
  setText(
    doc,
    '[data-testid="obligation-total-obligation"]',
    fmt(totals.obligation)
  )
  setText(
    doc,
    '[data-testid="obligation-total-accepted"]',
    fmt(totals.accepted)
  )
  setText(
    doc,
    '[data-testid="obligation-total-outstanding"]',
    fmt(totals.outstanding)
  )

  return 'rendered'
}
