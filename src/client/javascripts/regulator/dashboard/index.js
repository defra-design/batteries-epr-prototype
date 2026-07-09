import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'

const setText = (doc, selector, text) => {
  const el = doc.querySelector(selector)
  /* v8 ignore next */
  if (el) el.textContent = text
}

export const initRegulatorDashboard = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  storage.seedDemoData()
  const agency = storage.currentAgency()
  if (!agency) {
    loc.assign('/regulator/sign-in')
    return 'redirected-to-sign-in'
  }

  const payload = readPagePayload(doc)

  doc.querySelector('[data-testid="app-heading-title"]').textContent =
    agency.name

  const code = agency.code
  const schemes = storage.listSchemes().filter((s) => s.agencyCode === code)
  const operators = storage.listOperators().filter((o) => o.agencyCode === code)
  const producers = storage
    .listAllProducers()
    .filter((p) => p.agencyCode === code)
  const evidence = storage.listAllEvidence(payload.compliancePeriodYear)

  setText(
    doc,
    '[data-testid="tile-schemes-count"]',
    `${payload.copy.schemes.countLabel}: ${schemes.length}`
  )
  setText(
    doc,
    '[data-testid="tile-operators-count"]',
    `${payload.copy.operators.countLabel}: ${operators.length}`
  )
  setText(
    doc,
    '[data-testid="tile-producers-count"]',
    `${payload.copy.producers.countLabel}: ${producers.length}`
  )
  setText(
    doc,
    '[data-testid="tile-evidence-count"]',
    `${payload.copy.evidence.countLabel}: ${evidence.length}`
  )

  const schemesAction = doc.querySelector('[data-testid="tile-schemes-action"]')
  /* v8 ignore next 3 */
  if (schemesAction && payload.urls?.schemes) {
    schemesAction.innerHTML = `<a class="govuk-link" href="${payload.urls.schemes}">${payload.copy.schemes.viewAction}</a>`
  }

  const operatorsAction = doc.querySelector(
    '[data-testid="tile-operators-action"]'
  )
  /* v8 ignore next 3 */
  if (operatorsAction && payload.urls?.operators) {
    operatorsAction.innerHTML = `<a class="govuk-link" href="${payload.urls.operators}">${payload.copy.operators.viewAction}</a>`
  }

  const producersAction = doc.querySelector(
    '[data-testid="tile-producers-action"]'
  )
  /* v8 ignore next 3 */
  if (producersAction && payload.urls?.producers) {
    producersAction.innerHTML = `<a class="govuk-link" href="${payload.urls.producers}">${payload.copy.producers.manageAction}</a>`
  }

  const evidenceAction = doc.querySelector(
    '[data-testid="tile-evidence-action"]'
  )
  /* v8 ignore next 3 */
  if (evidenceAction && payload.urls?.evidence) {
    evidenceAction.innerHTML = `<a class="govuk-link" href="${payload.urls.evidence}">${payload.copy.evidence.manageAction}</a>`
  }

  return 'rendered'
}
