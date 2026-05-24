import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'

export const runOperatorSignIn = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  if (payload?.target !== 'setCurrentOperatorId') return 'hydrated'

  storage.setCurrentOperatorId(payload.operatorId)
  loc.assign(payload.nextStep)
  return 'navigated'
}
