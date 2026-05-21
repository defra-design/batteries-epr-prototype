import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'
import { hydrateForm } from '../../hydrate-form.js'

const firstScheme = () => storage.listSchemes()[0]

const ensureScheme = () => {
  storage.seedDemoData()
  return firstScheme()
}

const setText = (doc, selector, text) => {
  doc.querySelector(selector).textContent = text
}

const TONNAGE_STEPS = {
  placed: 'placed',
  exported: 'exported',
  'taken-back': 'takenBack',
  delivered: 'delivered'
}

const formValuesForStep = (step, submission) => {
  const key = TONNAGE_STEPS[step]
  if (key) return submission?.[key] ?? null
  if (step === 'declaration') {
    return {
      declarationAccepted: submission?.status === 'submitted' ? 'yes' : ''
    }
  }
  return null
}

const renderCheckAnswers = (doc, submission) => {
  for (const [step, key] of Object.entries(TONNAGE_STEPS)) {
    const data = submission?.[key] ?? {}
    setText(
      doc,
      `[data-testid="ia-check-${step}-industrial"]`,
      data.industrial ?? '—'
    )
    setText(
      doc,
      `[data-testid="ia-check-${step}-automotive"]`,
      data.automotive ?? '—'
    )
  }
}

export const runIaStep = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  const scheme = ensureScheme()

  if (payload.target === 'persist') {
    storage.upsertIaSubmission(
      scheme.id,
      payload.compliancePeriodYear,
      payload.patch
    )
    if (payload.next) {
      loc.assign(payload.next)
      return 'navigated'
    }
    return 'persisted'
  }

  const submission = storage.findIaSubmission(
    scheme.id,
    payload.compliancePeriodYear
  )

  if (payload.step === 'check-answers') {
    renderCheckAnswers(doc, submission)
    return 'hydrated'
  }

  const values = formValuesForStep(payload.step, submission)
  if (values) hydrateForm(doc.querySelector('form'), values)
  return 'hydrated'
}
