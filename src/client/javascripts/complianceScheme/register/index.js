import { storage, createScheme } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'

export const runSchemeRegister = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  if (payload?.target !== 'create') return 'hydrated'

  const scheme = storage.saveScheme(
    createScheme({
      agencyCode: payload.agencyCode,
      approvalStatus: 'in-progress'
    })
  )
  storage.setCurrentSchemeId(scheme.id)
  loc.assign(payload.nextStep)
  return 'navigated'
}
