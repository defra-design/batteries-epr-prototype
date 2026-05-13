import { requireAuth } from '../../../auth-gate.js'

export const initConfirmation = (_doc = globalThis.document) => {
  return requireAuth('/sign-in')
}
