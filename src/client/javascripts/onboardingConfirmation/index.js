import { storage } from '../storage-adapter.js'
import { requireAuth } from '../auth-gate.js'
import { readPagePayload } from '../page-payload.js'
import { currentCompliancePeriod } from '../compliance-period.js'

const findRegistration = (producerId, compliancePeriod) =>
  storage
    .listRegistrationsForProducer(producerId)
    .find((r) => r.compliancePeriod === compliancePeriod) ?? null

export const renderConfirmation = (doc = globalThis.document) => {
  if (!requireAuth('/sign-in')) return false

  const user = storage.getCurrentUser()
  const payload = readPagePayload(doc) ?? {}
  const compliancePeriod = payload.compliancePeriod ?? currentCompliancePeriod()

  const producer = storage.getProducerByEmail(user.email)
  const registration = producer
    ? findRegistration(producer.id, compliancePeriod)
    : null

  const bprn = producer?.bprn ?? 'Pending'
  const status = registration?.status ?? 'Started'

  const setText = (selector, text) => {
    const node = doc.querySelector(selector)
    if (node) node.textContent = text
  }
  setText('[data-testid="confirmation-bprn"]', bprn)
  setText('[data-testid="confirmation-bprn-row"]', bprn)
  setText('[data-testid="confirmation-status"]', status)
  setText('[data-testid="confirmation-period"]', compliancePeriod)

  return { bprn, status, compliancePeriod }
}
