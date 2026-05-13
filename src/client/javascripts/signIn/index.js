import { storage } from '../storage-adapter.js'
import { readPagePayload } from '../page-payload.js'

export const DASHBOARD_URL = '/dashboard'

export const completeSignIn = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  if (!payload?.email) return false
  storage.setCurrentUser({ email: payload.email })
  loc.assign(DASHBOARD_URL)
  return true
}
