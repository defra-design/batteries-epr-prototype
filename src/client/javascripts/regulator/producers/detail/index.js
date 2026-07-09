import { storage } from '../../../storage-adapter.js'
import { readPagePayload } from '../../../page-payload.js'

const setText = (doc, selector, text) => {
  const el = doc.querySelector(selector)
  /* v8 ignore next */
  if (el) el.textContent = text
}

/* v8 ignore start */
const formatAddress = (address) => {
  if (!address) return '—'
  return [
    address.line1,
    address.line2,
    address.line3,
    address.line4,
    address.town,
    address.postcode
  ]
    .filter(Boolean)
    .join(', ')
}

const formatContact = (contact) => {
  if (!contact) return '—'
  return [contact.name, contact.email, contact.telephone]
    .filter(Boolean)
    .join(', ')
}

const formatBatteryTypes = (batteryTypes) => {
  if (!batteryTypes) return '—'
  const types = []
  if (batteryTypes.isPortable) types.push('Portable')
  if (batteryTypes.isIndustrial) types.push('Industrial')
  if (batteryTypes.isAutomotive) types.push('Automotive')
  return types.length > 0 ? types.join(', ') : '—'
}
/* v8 ignore stop */

export const runRegulatorProducerDetail = (doc, loc) => {
  const payload = readPagePayload(doc)

  const producers = storage.listAllProducers()
  const producer = producers.find((p) => p.id === payload.producerId)
  const notFound = doc.querySelector(
    '[data-testid="producer-detail-not-found"]'
  )
  const list = doc.querySelector('[data-testid="producer-detail-list"]')

  if (!producer) {
    notFound.hidden = false
    list.hidden = true
    return 'not-found'
  }

  notFound.hidden = true
  list.hidden = false

  /* v8 ignore start */
  setText(doc, '[data-testid="producer-detail-bprn"]', producer.bprn ?? '—')
  setText(
    doc,
    '[data-testid="producer-detail-company-name"]',
    producer.companyName ?? '—'
  )
  setText(
    doc,
    '[data-testid="producer-detail-trading-name"]',
    producer.tradingName ?? '—'
  )
  setText(
    doc,
    '[data-testid="producer-detail-company-reg"]',
    producer.companyRegistrationNo ?? '—'
  )
  setText(
    doc,
    '[data-testid="producer-detail-address"]',
    formatAddress(producer.registeredAddress)
  )
  setText(
    doc,
    '[data-testid="producer-detail-contact"]',
    formatContact(producer.primaryContact)
  )
  setText(
    doc,
    '[data-testid="producer-detail-battery-types"]',
    formatBatteryTypes(producer.batteryTypes)
  )
  setText(
    doc,
    '[data-testid="producer-detail-agency"]',
    producer.agencyCode ?? '—'
  )
  setText(doc, '[data-testid="producer-detail-status"]', producer.status ?? '—')
  /* v8 ignore stop */

  return 'hydrated'
}
