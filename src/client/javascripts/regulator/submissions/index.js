import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'

const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

const escape = (value) =>
  /* v8 ignore next */
  String(value).replace(/[&<>"']/g, (char) => HTML_ENTITIES[char])

const STATUS_TAG_CLASSES = {
  'not-started': 'govuk-tag--grey',
  'in-progress': 'govuk-tag--yellow',
  submitted: 'govuk-tag--blue'
}

/* v8 ignore start */
const resolveEntityName = (item) => {
  if (item.schemeId) {
    const scheme = storage.getScheme(item.schemeId)
    return scheme?.name ?? item.schemeId
  }
  if (item.operatorId) {
    const operator = storage.getOperator(item.operatorId)
    return operator?.name ?? item.operatorId
  }
  return '—'
}

const formatPeriod = (item) => {
  const year = item.compliancePeriodYear ?? '—'
  if (item.quarter) return `${year} ${item.quarter}`
  return year
}
/* v8 ignore stop */

export const runRegulatorSubmissionsPage = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)

  storage.seedDemoData()
  const agency = storage.currentAgency()
  if (!agency) {
    loc.assign('/regulator/sign-in')
    return 'redirected-to-sign-in'
  }

  const year = payload.compliancePeriodYear
  const typeLabels = payload.copy.typeLabels

  const schemeQuarterly = storage
    .listAllQuarterlySubmissions(year)
    .map((s) => ({ ...s, typeLabel: typeLabels.schemeQuarterly }))

  const schemeIa = storage
    .listAllIaSubmissions(year)
    .map((s) => ({ ...s, typeLabel: typeLabels.schemeIa }))

  const operatorQuarterly = storage
    .listAllOperatorQuarterlyReturns(year)
    .map((r) => ({ ...r, typeLabel: typeLabels.operatorQuarterly }))

  const operatorAnnual = storage
    .listAllOperatorAnnualReturns(year)
    .map((r) => ({ ...r, typeLabel: typeLabels.operatorAnnual }))

  const allItems = [
    ...schemeQuarterly,
    ...schemeIa,
    ...operatorQuarterly,
    ...operatorAnnual
  ]

  const body = doc.querySelector('[data-testid="submissions-body"]')
  const empty = doc.querySelector('[data-testid="submissions-empty"]')

  if (allItems.length === 0) {
    body.innerHTML = ''
    empty.hidden = false
    return 'rendered-empty'
  }

  empty.hidden = true
  body.innerHTML = allItems
    /* v8 ignore start */
    .map((item) => {
      const entityName = resolveEntityName(item)
      const statusText = payload.copy.statuses[item.status] ?? item.status
      const tagClass = STATUS_TAG_CLASSES[item.status] ?? ''
      return `<tr class="govuk-table__row" data-testid="submission-row">
        <td class="govuk-table__cell" data-testid="submission-row-entity">${escape(entityName)}</td>
        <td class="govuk-table__cell" data-testid="submission-row-type"><strong class="govuk-tag govuk-tag--grey">${escape(item.typeLabel)}</strong></td>
        <td class="govuk-table__cell" data-testid="submission-row-period">${escape(formatPeriod(item))}</td>
        <td class="govuk-table__cell" data-testid="submission-row-status"><strong class="govuk-tag ${tagClass}">${escape(statusText)}</strong></td>
      </tr>`
    })
    /* v8 ignore stop */
    .join('')

  return 'rendered'
}
