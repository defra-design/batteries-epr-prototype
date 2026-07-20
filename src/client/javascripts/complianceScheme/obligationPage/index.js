import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'
import { buildObligationSnapshot, resolveTargets } from '../obligation.js'

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

const setOptionalText = (doc, selector, text) => {
  const node = doc.querySelector(selector)
  if (node) node.textContent = text
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

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

const getOrCreateSnapshot = ({ scheme, year, quarterly, evidence }) => {
  const existing = storage.getObligationSnapshot(scheme.id, year)
  if (existing) return existing
  return storage.saveObligationSnapshot(
    buildObligationSnapshot({
      scheme,
      compliancePeriodYear: year,
      quarterly,
      evidence,
      targets: resolveTargets(scheme.agencyCode)
    })
  )
}

const renderCertificate = (doc, snapshot, copy) => {
  setOptionalText(
    doc,
    '[data-testid="obligation-certificate-calculated-at"]',
    formatDateTime(snapshot.calculatedAt)
  )
  setOptionalText(
    doc,
    '[data-testid="obligation-certificate-rule-version"]',
    snapshot.rules.version
  )
  setOptionalText(
    doc,
    '[data-testid="obligation-certificate-config"]',
    `${snapshot.rules.configSource} ${snapshot.rules.configVersion}`
  )
  const targets = doc.querySelector(
    '[data-testid="obligation-certificate-targets"]'
  )
  if (!targets) return
  targets.innerHTML = snapshot.batteryCategories
    .map((category) => {
      const label = copy.categories[category]
      return `<li class="govuk-body">${escape(label)}: collection ${snapshot.targets.collection[category]}%, recycling ${snapshot.targets.recycling[category]}%</li>`
    })
    .join('')
}

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
  const snapshot = getOrCreateSnapshot({ scheme, year, quarterly, evidence })
  const { rows, totals } = snapshot
  renderCertificate(doc, snapshot, payload.copy)

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
