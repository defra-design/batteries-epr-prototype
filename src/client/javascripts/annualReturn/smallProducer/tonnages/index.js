import { readPagePayload } from '../../../page-payload.js'
import { hydrateForm } from '../../../hydrate-form.js'
import { requireAuth } from '../../../auth-gate.js'
import {
  readActiveSubmission,
  submissionToFormValues,
  upsertSubmission
} from '../persist-submission.js'

const showSection = (doc, mode) => {
  const simple = doc.querySelector('[data-testid="simple-fields"]')
  const detailed = doc.querySelector('[data-testid="detailed-fields"]')
  if (simple) simple.hidden = mode !== 'simple'
  if (detailed) detailed.hidden = mode !== 'detailed'
}

const sumActiveTonnages = (doc, mode) => {
  const inputs = doc.querySelectorAll(`[data-tonnage-input="${mode}"]`)
  let total = 0
  inputs.forEach((input) => {
    const value = Number(input.value)
    if (Number.isFinite(value) && value > 0) total += value
  })
  return total.toFixed(3)
}

const updateGrandTotal = (doc, mode) => {
  const node = doc.querySelector('[data-testid="grand-total-value"]')
  if (node) node.textContent = sumActiveTonnages(doc, mode)
}

const currentMode = (doc) => {
  const checked = doc.querySelector('input[name="mode"]:checked')
  return checked?.value === 'detailed' ? 'detailed' : 'simple'
}

const wireListeners = (doc) => {
  const refresh = () => {
    const mode = currentMode(doc)
    showSection(doc, mode)
    updateGrandTotal(doc, mode)
  }
  doc
    .querySelectorAll('input[name="mode"]')
    .forEach((radio) => radio.addEventListener('change', refresh))
  doc
    .querySelectorAll('[data-tonnage-input]')
    .forEach((input) => input.addEventListener('input', refresh))
  refresh()
}

export const initTonnages = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  if (!requireAuth('/sign-in')) return false

  const payload = readPagePayload(doc) ?? {}

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

  if (!payload.skipHydration) {
    const submission = readActiveSubmission(payload.registrationId)
    const values = submissionToFormValues(submission)
    const form = doc.querySelector('form')
    if (form) hydrateForm(form, values)
  }

  wireListeners(doc)
  return 'hydrated'
}
