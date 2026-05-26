import { storage } from '../../../storage-adapter.js'
import { readPagePayload } from '../../../page-payload.js'

export const runRegulatorSchemeWithdraw = (doc, loc) => {
  const payload = readPagePayload(doc)

  if (payload.target === 'persist') {
    storage.withdrawSchemeApproval(payload.schemeId, payload.reason)
    loc.assign('/regulator/schemes')
    return 'navigated'
  }

  const scheme = storage.getScheme(payload.schemeId)
  const nameEl = doc.querySelector('[data-testid="scheme-withdraw-name"]')
  if (scheme && nameEl) {
    nameEl.textContent = scheme.name
    nameEl.hidden = false
  }

  return 'hydrated'
}
