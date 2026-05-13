import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'
import { escape, formatAddress, formatBatteryTypes } from '../render-helpers.js'

const renderCard = (record) => `
  <div data-testid="producer-detail-card">
    <h2 class="govuk-heading-m" data-testid="producer-detail-name">${escape(record.companyName)}</h2>
    <dl class="govuk-summary-list">
      <div class="govuk-summary-list__row">
        <dt class="govuk-summary-list__key">BPRN</dt>
        <dd class="govuk-summary-list__value" data-testid="producer-detail-bprn">${escape(record.bprn)}</dd>
      </div>
      <div class="govuk-summary-list__row">
        <dt class="govuk-summary-list__key">Registered address</dt>
        <dd class="govuk-summary-list__value">${escape(formatAddress(record.registeredAddress))}</dd>
      </div>
      <div class="govuk-summary-list__row">
        <dt class="govuk-summary-list__key">Battery types</dt>
        <dd class="govuk-summary-list__value">${escape(formatBatteryTypes(record.batteryTypes))}</dd>
      </div>
      <div class="govuk-summary-list__row">
        <dt class="govuk-summary-list__key">Brand names</dt>
        <dd class="govuk-summary-list__value">${escape((record.brandNames || []).join(', ') || 'None')}</dd>
      </div>
    </dl>
  </div>
`

const renderNotFound = (bprn, searchUrl) => `
  <div data-testid="producer-detail-not-found">
    <p class="govuk-body">No producer matches BPRN <strong>${escape(bprn)}</strong>.</p>
    <p class="govuk-body"><a class="govuk-link" href="${escape(searchUrl)}">Return to the public register</a></p>
  </div>
`

export const initDetail = (doc = globalThis.document) => {
  storage.seedDemoData()

  const payload = readPagePayload(doc)
  const bprn = payload?.bprn ?? ''
  const searchUrl = payload?.searchUrl ?? '/register/search'

  const container = doc.getElementById('producer-detail')
  if (!container) return null

  const record = bprn ? storage.getPublicProducer(bprn) : null
  container.innerHTML = record
    ? renderCard(record)
    : renderNotFound(bprn, searchUrl)
  return record
}
