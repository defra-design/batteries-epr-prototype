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

export const runRegulatorSchemeList = (doc, loc) => {
  const payload = readPagePayload(doc)
  const agency = storage.currentAgency()
  const schemes = storage.listSchemes().filter((s) => s.agencyCode === agency?.code)
  const body = doc.querySelector('[data-testid="schemes-body"]')
  const empty = doc.querySelector('[data-testid="schemes-empty"]')

  if (schemes.length === 0) {
    body.innerHTML = ''
    empty.hidden = false
    return 'rendered-empty'
  }

  empty.hidden = true
  body.innerHTML = schemes
    /* v8 ignore start */
    .map((scheme) => {
      const detailHref = payload.urls.detailTemplate.replace('{schemeId}', scheme.id)
      const statusText = payload.copy.statuses[scheme.approvalStatus] ?? scheme.approvalStatus
      const tagClass = STATUS_TAG_CLASSES[scheme.approvalStatus] ?? ''
      return `<tr class="govuk-table__row" data-testid="scheme-row">
        <td class="govuk-table__cell" data-testid="scheme-row-name">${escape(scheme.name)}</td>
        <td class="govuk-table__cell" data-testid="scheme-row-approval-number">${escape(scheme.approvalNumber ?? '—')}</td>
        <td class="govuk-table__cell" data-testid="scheme-row-status"><strong class="govuk-tag ${tagClass}">${escape(statusText)}</strong></td>
        <td class="govuk-table__cell" data-testid="scheme-row-agency">${escape(scheme.agencyCode ?? '—')}</td>
        <td class="govuk-table__cell"><a class="govuk-link" href="${escape(detailHref)}" data-testid="scheme-row-view">${escape(payload.copy.viewAction)}</a></td>
      </tr>`
    })
    /* v8 ignore stop */
    .join('')

  return 'rendered'
}
