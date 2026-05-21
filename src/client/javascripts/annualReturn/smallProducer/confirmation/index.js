import { requireAuth } from '../../../auth-gate.js'
import { readPagePayload } from '../../../page-payload.js'
import { redirectIfSchemeRoute } from '../../scheme-represented-gate.js'

export const initConfirmation = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  if (!requireAuth('/sign-in')) return false
  const payload = readPagePayload(doc) ?? {}
  if (redirectIfSchemeRoute(payload.registrationId, loc)) {
    return 'redirected-to-scheme-represented'
  }
  return true
}
