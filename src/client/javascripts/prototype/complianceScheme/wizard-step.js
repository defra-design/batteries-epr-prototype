import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'

const DEFAULT_AUTO_ADVANCE_DELAY_MS = 5000

const hydrateSingleMemberDetails = (doc, payload) => {
  const select = doc.getElementById('memberId')
  const bprn = doc.getElementById('bprn')
  if (!select || !bprn) return 'no-op'

  const fill = () => {
    const member = payload.members.find((m) => m.id === select.value)
    bprn.value = member?.bprn ?? ''
  }

  const draft = storage.getPrototypeComplianceSchemeSubmissionDraft(
    payload.year,
    payload.quarter
  )
  if (!select.value && draft.memberId) select.value = draft.memberId
  fill()
  select.addEventListener('change', fill)
  return 'hydrated'
}

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

  if (payload.target === 'hydrate' && payload.step === 'singleMemberDetails') {
    return hydrateSingleMemberDetails(doc, payload)
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
