import { storage } from '../../../storage-adapter.js'
import { readPagePayload } from '../../../page-payload.js'

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
  'awaiting-acceptance': 'govuk-tag--blue',
  accepted: 'govuk-tag--green',
  cancelled: 'govuk-tag--red',
  'awaiting-authorisation': 'govuk-tag--yellow'
}

/* v8 ignore start */
const resolveIssuerName = (item) => {
  if (item.direction === 'operator-to-scheme' && item.issuedByOperatorId) {
    const operator = storage.getOperator(item.issuedByOperatorId)
    return operator?.name ?? '—'
  }
  if (item.schemeId) {
    const scheme = storage.getScheme(item.schemeId)
    return scheme?.name ?? '—'
  }
  return '—'
}
/* v8 ignore stop */

export const runRegulatorEvidenceList = (doc, loc) => {
  const payload = readPagePayload(doc)
  const evidence = storage.listAllEvidence(payload.compliancePeriodYear)
  const body = doc.querySelector('[data-testid="evidence-body"]')
  const empty = doc.querySelector('[data-testid="evidence-empty"]')

  if (evidence.length === 0) {
    body.innerHTML = ''
    empty.hidden = false
    return 'rendered-empty'
  }

  empty.hidden = true
  body.innerHTML = evidence
    /* v8 ignore start */
    .map((item) => {
      const detailHref = payload.urls.detailTemplate.replace('{evidenceId}', item.id)
      const issuerName = resolveIssuerName(item)
      const categoryText = payload.copy.categories[item.category] ?? item.category ?? '—'
      const statusText = payload.copy.statuses[item.status] ?? item.status ?? '—'
      const tagClass = STATUS_TAG_CLASSES[item.status] ?? ''
      return `<tr class="govuk-table__row" data-testid="evidence-row">
        <td class="govuk-table__cell" data-testid="evidence-row-issuer">${escape(issuerName)}</td>
        <td class="govuk-table__cell" data-testid="evidence-row-recipient">${escape(item.recipientName ?? '—')}</td>
        <td class="govuk-table__cell" data-testid="evidence-row-category">${escape(categoryText)}</td>
        <td class="govuk-table__cell" data-testid="evidence-row-tonnes">${escape(item.tonnes ?? '—')}</td>
        <td class="govuk-table__cell" data-testid="evidence-row-status"><strong class="govuk-tag ${tagClass}">${escape(statusText)}</strong></td>
        <td class="govuk-table__cell"><a class="govuk-link" href="${escape(detailHref)}" data-testid="evidence-row-view">${escape(payload.copy.viewAction)}</a></td>
      </tr>`
    })
    /* v8 ignore stop */
    .join('')

  return 'rendered'
}
