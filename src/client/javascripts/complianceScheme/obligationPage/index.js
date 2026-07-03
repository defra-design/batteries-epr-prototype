import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'
import { buildObligation, resolveTargets } from '../obligation.js'

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

const setAll = (doc, selector, text) => {
  for (const node of doc.querySelectorAll(selector)) {
    node.textContent = text
  }
}

const ensureScheme = (loc) => {
  storage.seedDemoData()
  const scheme = storage.currentScheme()
  if (!scheme) {
    loc.assign('/compliance-scheme/sign-in')
    return null
  }
  return scheme
}

const fmt = (value) => value.toFixed(3)

const setCalcFigures = (doc, row) => {
  const formulas = {
    collection: {
      targetPercent: row.collectionTargetPercent,
      obligation: row.collectionObligation
    },
    recycling: {
      targetPercent: row.targetPercent,
      obligation: row.obligation
    }
  }
  for (const [type, { targetPercent, obligation }] of Object.entries(
    formulas
  )) {
    const prefix = `[data-testid="obligation-calc-${row.category}-${type}`
    setAll(doc, `${prefix}-placed"]`, fmt(row.placed))
    setAll(doc, `${prefix}-target"]`, String(targetPercent))
    setAll(doc, `${prefix}-obligation"]`, fmt(obligation))
  }
}

export const runObligationPage = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  const scheme = ensureScheme(loc)
  if (!scheme) return 'redirected-to-sign-in'
  const year = payload.compliancePeriodYear

  const quarterly = storage.listQuarterlySubmissions(scheme.id, year)
  const evidence = storage.listEvidence(scheme.id, year)
  const targets = resolveTargets(scheme.agencyCode)
  const { rows, totals } = buildObligation({ quarterly, evidence, targets })

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

  for (const row of rows) {
    setCalcFigures(doc, row)
  }

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
