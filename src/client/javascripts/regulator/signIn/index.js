import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'

export const runRegulatorSignIn = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  if (payload?.target !== 'setCurrentAgencyCode') return 'hydrated'

  storage.setCurrentAgencyCode(payload.agencyCode)
  if (payload.regulatorUser) {
    storage.setCurrentRegulatorUser(payload.regulatorUser)
  }
  loc.assign(payload.nextStep)
  return 'navigated'
}
