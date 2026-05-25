import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'
import { hydrateForm } from '../../hydrate-form.js'
import { HYDRATORS } from './hydrators.js'

const ensureOperator = (loc) => {
  storage.seedDemoData()
  const operator = storage.currentOperator()
  if (!operator) {
    loc.assign('/operator/sign-in')
    return null
  }
  return operator
}

const applyPatch = (operator, patch) =>
  storage.saveOperator({ ...operator, ...patch })

export const runApplicationStep = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  const operator = ensureOperator(loc)
  if (!operator) return 'redirected-to-sign-in'

  if (payload.target === 'persist') {
    applyPatch(operator, payload.patch)
    if (payload.next) {
      loc.assign(payload.next)
      return 'navigated'
    }
    return 'persisted'
  }

  const hydrator = HYDRATORS[payload.step]
  if (hydrator) {
    const form = doc.querySelector('form')
    if (form) hydrateForm(form, hydrator(operator))
  }
  return 'hydrated'
}
