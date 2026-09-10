import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'

const DEFAULT_AUTO_ADVANCE_DELAY_MS = 5000

export const runPrototypeComplianceSchemeStep = (
  doc = globalThis.document,
  loc = globalThis.location,
  wait = globalThis.setTimeout
) => {
  const payload = readPagePayload(doc)
  if (!payload) return 'no-op'

  if (payload.target === 'auto-advance') {
    wait(
      () => loc.assign(payload.nextStep),
      payload.delayMs ?? DEFAULT_AUTO_ADVANCE_DELAY_MS
    )
    return 'auto-advancing'
  }

  if (payload.target !== 'save') return 'no-op'

  storage.savePrototypeComplianceSchemeSubmissionDraft(
    payload.year,
    payload.quarter,
    payload.savedFields
  )

  if (payload.nextStep) {
    loc.assign(payload.nextStep)
    return 'navigated'
  }

  return 'saved'
}
