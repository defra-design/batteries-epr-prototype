import { storage } from '../storage-adapter.js'
import { readPagePayload } from '../page-payload.js'

export const DEFAULT_SIGNED_OUT_URL = '/signed-out'

export const completeSignOut = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  storage.signOut()
  const payload = readPagePayload(doc)
  const target = payload?.signedOutUrl ?? DEFAULT_SIGNED_OUT_URL
  loc.assign(target)
}
