import { requireAuth } from '../../../auth-gate.js'

export const initIaConfirmation = (_doc = globalThis.document) => {
  return requireAuth('/sign-in')
}
