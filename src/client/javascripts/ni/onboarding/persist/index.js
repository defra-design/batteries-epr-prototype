import { storage } from '../../storage.js'

const PAYLOAD_ID = 'ni-persist-payload'

export const initNiOnboardingPersist = (doc = globalThis.document) => {
  const payload = storage.readJsonScript(doc, PAYLOAD_ID)
  if (!payload) return null
  return storage.saveRegistration(payload)
}
