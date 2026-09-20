import { storage } from '../../../storage-adapter.js'
import { readPagePayload } from '../../../page-payload.js'
import { renderIncomingDeliveries } from './dashboard.js'

export const runPrototypeAbtoIncomingWasteStep = (
  doc = globalThis.document
) => {
  const payload = readPagePayload(doc)
  if (!payload) return 'no-payload'

  if (payload.step === 'dashboard') {
    renderIncomingDeliveries(doc, storage.getPrototypeAbtoDeliveries(), payload)
  }

  return 'hydrated'
}
