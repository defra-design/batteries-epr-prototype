import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'

export const runSchemeSignIn = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  if (payload?.target !== 'setCurrentSchemeId') return 'hydrated'

  storage.setCurrentSchemeId(payload.schemeId)
  loc.assign(payload.nextStep)
  return 'navigated'
}
