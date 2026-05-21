import { storage } from '../storage-adapter.js'
import { requireAuth } from '../auth-gate.js'
import { readPagePayload } from '../page-payload.js'
import { currentCompliancePeriod } from '../compliance-period.js'

const DRAFT_KEY = 'npwd-batteries:leave-scheme-draft'

const findActiveSchemeRegistration = (producerId, compliancePeriod) =>
  storage
    .listRegistrationsForProducer(producerId)
    .find(
      (r) =>
        r.compliancePeriod === compliancePeriod &&
        r.producerRoute === 'complianceScheme' &&
        r.status !== 'superseded'
    ) ?? null

const readDraft = () => {
  const raw = globalThis.localStorage.getItem(DRAFT_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const writeDraft = (draft) => {
  globalThis.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
}

const clearDraft = () => {
  globalThis.localStorage.removeItem(DRAFT_KEY)
}

export const runLeaveSchemeStep = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  if (!requireAuth('/sign-in')) return false

  const user = storage.getCurrentUser()
  const producer = storage.getProducerByEmail(user.email)
  if (!producer) {
    loc.assign('/account')
    return 'redirected-to-account'
  }

  const compliancePeriod = currentCompliancePeriod()
  const payload = readPagePayload(doc)

  if (payload.step === 'leaveSchemeConfirmation') {
    const bprnEl = doc.querySelector('[data-testid="leave-scheme-bprn"]')
    if (bprnEl) bprnEl.textContent = producer.bprn ?? ''
    return 'confirmation'
  }

  const activeReg = findActiveSchemeRegistration(producer.id, compliancePeriod)
  if (!activeReg) {
    loc.assign('/account')
    return 'redirected-not-member'
  }

  if (payload.target === 'saveDraft' && payload.savedFields) {
    writeDraft(payload.savedFields)
    loc.assign(payload.nextStep)
    return 'navigated'
  }

  if (payload.target === 'transition') {
    const draft = readDraft()
    if (!draft) {
      loc.assign('/leave-scheme/reason')
      return 'redirected-no-draft'
    }
    storage.transitionToDirect({
      producerEmail: user.email,
      compliancePeriod,
      reasonForLeaving: draft.reasonForLeaving,
      otherReason: draft.otherReason
    })
    clearDraft()
    loc.assign(payload.nextStep)
    return 'navigated'
  }

  if (payload.step === 'leaveSchemeDeclaration') {
    const draft = readDraft()
    if (!draft) {
      loc.assign('/leave-scheme/reason')
      return 'redirected-no-draft'
    }
    const reasonEl = doc.querySelector(
      '[data-testid="leave-scheme-summary-reason"]'
    )
    if (reasonEl) {
      reasonEl.textContent =
        draft.reasonForLeaving === 'other'
          ? draft.otherReason || 'Other'
          : draft.reasonForLeaving
    }
    return 'hydrated'
  }

  return 'hydrated'
}
