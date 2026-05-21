import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'
import { hydrateForm } from '../../hydrate-form.js'
import { HYDRATORS } from './hydrators.js'

const firstScheme = () => storage.listSchemes()[0]

const ensureScheme = () => {
  storage.seedDemoData()
  return firstScheme()
}

const applyPatch = (scheme, patch) => storage.saveScheme({ ...scheme, ...patch })

export const runApplicationStep = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  const scheme = ensureScheme()

  if (payload.target === 'persist') {
    applyPatch(scheme, payload.patch)
    if (payload.next) {
      loc.assign(payload.next)
      return 'navigated'
    }
    return 'persisted'
  }

  const hydrator = HYDRATORS[payload.step]
  if (hydrator) {
    const form = doc.querySelector('form')
    if (form) hydrateForm(form, hydrator(scheme))
  }
  return 'hydrated'
}
