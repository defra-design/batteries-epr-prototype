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
  'not-started': 'govuk-tag--grey',
  'in-progress': 'govuk-tag--yellow',
  submitted: 'govuk-tag--blue',
  approved: 'govuk-tag--green',
  rejected: 'govuk-tag--red',
  withdrawn: 'govuk-tag--red'
}

export const runRegulatorOperatorList = (doc, loc) => {
  const payload = readPagePayload(doc)
  const agency = storage.currentAgency()
  const operators = storage.listOperators().filter((o) => o.agencyCode === agency?.code)
  const body = doc.querySelector('[data-testid="operators-body"]')
  const empty = doc.querySelector('[data-testid="operators-empty"]')

  if (operators.length === 0) {
    body.innerHTML = ''
    empty.hidden = false
    return 'rendered-empty'
  }

  empty.hidden = true
  body.innerHTML = operators
    /* v8 ignore start */
    .map((op) => {
      const detailHref = payload.urls.detailTemplate.replace('{operatorId}', op.id)
      const statusText = payload.copy.statuses[op.approvalStatus] ?? op.approvalStatus
      const tagClass = STATUS_TAG_CLASSES[op.approvalStatus] ?? ''
      const typeLabel = payload.copy.typeLabels[op.approvalType] ?? op.approvalType
      return `<tr class="govuk-table__row" data-testid="operator-row">
        <td class="govuk-table__cell" data-testid="operator-row-name">${escape(op.name)}</td>
        <td class="govuk-table__cell" data-testid="operator-row-type">${escape(typeLabel)}</td>
        <td class="govuk-table__cell" data-testid="operator-row-approval-number">${escape(op.approvalNumber ?? '—')}</td>
        <td class="govuk-table__cell" data-testid="operator-row-status"><strong class="govuk-tag ${tagClass}">${escape(statusText)}</strong></td>
        <td class="govuk-table__cell" data-testid="operator-row-agency">${escape(op.agencyCode ?? '—')}</td>
        <td class="govuk-table__cell"><a class="govuk-link" href="${escape(detailHref)}" data-testid="operator-row-view">${escape(payload.copy.viewAction)}</a></td>
      </tr>`
    })
    /* v8 ignore stop */
    .join('')

  return 'rendered'
}
