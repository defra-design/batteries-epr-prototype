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

/* v8 ignore start */
const formatBatteryTypes = (batteryTypes) => {
  if (!batteryTypes) return '—'
  const types = []
  if (batteryTypes.isPortable) types.push('Portable')
  if (batteryTypes.isIndustrial) types.push('Industrial')
  if (batteryTypes.isAutomotive) types.push('Automotive')
  return types.length > 0 ? types.join(', ') : '—'
}
/* v8 ignore stop */

export const runRegulatorProducerList = (doc, loc) => {
  const payload = readPagePayload(doc)
  const agency = storage.currentAgency()
  const producers = storage.listAllProducers().filter((p) => p.agencyCode === agency?.code)
  const body = doc.querySelector('[data-testid="producers-body"]')
  const empty = doc.querySelector('[data-testid="producers-empty"]')

  if (producers.length === 0) {
    body.innerHTML = ''
    empty.hidden = false
    return 'rendered-empty'
  }

  empty.hidden = true
  body.innerHTML = producers
    /* v8 ignore start */
    .map((producer) => {
      const detailHref = payload.urls.detailTemplate.replace('{producerId}', producer.id)
      return `<tr class="govuk-table__row" data-testid="producer-row">
        <td class="govuk-table__cell" data-testid="producer-row-bprn">${escape(producer.bprn ?? '—')}</td>
        <td class="govuk-table__cell" data-testid="producer-row-company-name">${escape(producer.companyName ?? '—')}</td>
        <td class="govuk-table__cell" data-testid="producer-row-agency">${escape(producer.agencyCode ?? '—')}</td>
        <td class="govuk-table__cell" data-testid="producer-row-status">${escape(producer.status ?? '—')}</td>
        <td class="govuk-table__cell" data-testid="producer-row-battery-types">${escape(formatBatteryTypes(producer.batteryTypes))}</td>
        <td class="govuk-table__cell"><a class="govuk-link" href="${escape(detailHref)}" data-testid="producer-row-view">${escape(payload.copy.viewAction)}</a></td>
      </tr>`
    })
    /* v8 ignore stop */
    .join('')

  return 'rendered'
}
