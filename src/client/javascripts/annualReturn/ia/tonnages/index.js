import { storage } from '../../../storage-adapter.js'
import { readPagePayload } from '../../../page-payload.js'
import { hydrateForm } from '../../../hydrate-form.js'
import { requireAuth } from '../../../auth-gate.js'
import {
  readActiveSubmission,
  submissionToFormValues,
  upsertSubmission
} from '../persist-submission.js'
import { redirectIfSchemeRoute } from '../../scheme-represented-gate.js'

const showCategoriesForProducer = (doc, producer) => {
  const battery = producer?.batteryTypes ?? {}
  doc.querySelectorAll('[data-ia-category]').forEach((section) => {
    const category = section.getAttribute('data-ia-category')
    if (category === 'industrial') section.hidden = !battery.isIndustrial
    if (category === 'automotive') section.hidden = !battery.isAutomotive
  })
}

const sumActivity = (doc, activity) => {
  const inputs = doc.querySelectorAll(
    `[data-tonnage-input="ia"][data-activity="${activity}"]`
  )
  let total = 0
  inputs.forEach((input) => {
    const section = input.closest('[data-ia-category]')
    if (section?.hidden) return
    const value = Number(input.value)
    if (Number.isFinite(value) && value > 0) total += value
  })
  return total.toFixed(3)
}

const updateTotals = (doc) => {
  const activities = ['placed', 'collected', 'delivered', 'exported']
  for (const activity of activities) {
    const node = doc.querySelector(`[data-testid="ia-total-${activity}"]`)
    if (node) node.textContent = `${sumActivity(doc, activity)} tonnes`
  }
}

const wireListeners = (doc) => {
  doc.querySelectorAll('[data-tonnage-input="ia"]').forEach((input) => {
    input.addEventListener('input', () => updateTotals(doc))
  })
  updateTotals(doc)
}

export const initIaTonnages = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc) ?? {}
  const signInUrl = payload.signInUrl ?? '/sign-in'
  if (!requireAuth(signInUrl)) return false

  if (redirectIfSchemeRoute(payload.registrationId, loc)) {
    return 'redirected-to-scheme-represented'
  }

  if (payload.target === 'submission') {
    if (payload.savedFields) {
      upsertSubmission(payload.registrationId, payload.savedFields)
    }
    if (payload.nextStep) {
      loc.assign(payload.nextStep)
      return 'navigated'
    }
    return 'persisted'
  }

  const user = storage.getCurrentUser()
  const producer = storage.getProducerByEmail(user.email)
  showCategoriesForProducer(doc, producer)

  if (!payload.skipHydration) {
    const submission = readActiveSubmission(payload.registrationId)
    const values = submissionToFormValues(submission)
    const form = doc.querySelector('form')
    if (form) hydrateForm(form, values)
  }

  wireListeners(doc)
  return 'hydrated'
}
