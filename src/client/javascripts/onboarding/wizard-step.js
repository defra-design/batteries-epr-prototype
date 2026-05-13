import { storage } from '../storage-adapter.js'
import { readPagePayload } from '../page-payload.js'
import { hydrateForm } from '../hydrate-form.js'
import { requireAuth } from '../auth-gate.js'
import {
  persistProducerFields,
  persistRegistrationFields,
  readOnboardingState,
  submitRegistration
} from './persist-fields.js'

const handlePersist = (user, payload) => {
  if (payload.target === 'producer') {
    persistProducerFields(user.email, payload.savedFields)
  } else if (payload.target === 'registration') {
    persistRegistrationFields(
      user.email,
      payload.compliancePeriod,
      payload.savedFields
    )
  } else if (payload.target === 'registration-and-submit') {
    persistRegistrationFields(
      user.email,
      payload.compliancePeriod,
      payload.savedFields
    )
    submitRegistration(user.email, payload.compliancePeriod)
  } else {
    submitRegistration(user.email, payload.compliancePeriod)
  }
}

export const runOnboardingStep = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  if (!requireAuth('/sign-in')) return false

  const user = storage.getCurrentUser()
  const payload = readPagePayload(doc) || { compliancePeriod: '2026' }

  if (payload.savedFields || payload.target === 'submit') {
    handlePersist(user, payload)
    if (payload.nextStep) {
      loc.assign(payload.nextStep)
      return 'navigated'
    }
    return 'persisted'
  }

  const existing = readOnboardingState(user.email, payload.compliancePeriod)
  const form = doc.querySelector('form')
  if (form && !payload.skipHydration) hydrateForm(form, existing)

  if (payload.step === 'producerRoute') {
    applyProducerRouteGate(doc, existing)
  }

  return payload.skipHydration ? 'preserved' : 'hydrated'
}

const applyProducerRouteGate = (doc, existing) => {
  const forcedDirect = Boolean(existing.isIndustrial || existing.isAutomotive)
  const smallRadio = doc.querySelector(
    'input[name="producerRoute"][value="smallProducer"]'
  )
  const smallContainer = smallRadio?.closest('.govuk-radios__item') ?? null
  const directRadio = doc.querySelector(
    'input[name="producerRoute"][value="directRegistrant"]'
  )
  const forcedNotice = doc.querySelector('[data-testid="forced-direct"]')

  if (forcedDirect) {
    if (smallContainer) smallContainer.hidden = true
    if (smallRadio) smallRadio.checked = false
    if (directRadio && !directRadio.checked) directRadio.checked = true
    if (forcedNotice) forcedNotice.hidden = false
  } else if (forcedNotice) {
    forcedNotice.hidden = true
  }
}
