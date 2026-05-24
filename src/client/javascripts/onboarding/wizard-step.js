import { storage } from '../storage-adapter.js'
import { readPagePayload } from '../page-payload.js'
import { hydrateForm } from '../hydrate-form.js'
import { requireAuth } from '../auth-gate.js'
import { currentCompliancePeriod } from '../compliance-period.js'
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
  const payload = readPagePayload(doc) || {
    compliancePeriod: currentCompliancePeriod()
  }

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
  } else if (payload.step === 'schemeConfirm') {
    applySchemeConfirm(doc, existing)
  } else if (payload.step === 'schemeSelect') {
    applySchemeSelectAgencyFilter(doc, user.email)
  }

  return payload.skipHydration ? 'preserved' : 'hydrated'
}

const setText = (doc, testId, value) => {
  const el = doc.querySelector(`[data-testid="${testId}"]`)
  if (el) el.textContent = value || '—'
}

const applySchemeSelectAgencyFilter = (doc, email) => {
  const producer = storage.getProducerByEmail(email)
  const producerAgency = producer?.agencyCode
  if (!producerAgency) return
  let visible = 0
  for (const scheme of storage.listSchemes()) {
    const radio = doc.querySelector(
      `input[name="schemeId"][value="${scheme.id}"]`
    )
    const item = radio?.closest('.govuk-radios__item') ?? null
    if (!item) continue
    if (scheme.agencyCode && scheme.agencyCode !== producerAgency) {
      item.hidden = true
      radio.checked = false
    } else {
      visible += 1
    }
  }
  const noMatch = doc.querySelector(
    '[data-testid="scheme-select-no-agency-match"]'
  )
  if (noMatch) noMatch.hidden = visible !== 0
}

const applySchemeConfirm = (doc, existing) => {
  const scheme = existing.schemeId ? storage.getScheme(existing.schemeId) : null
  if (!scheme) return
  setText(doc, 'scheme-confirm-name', scheme.name)
  setText(doc, 'scheme-confirm-operator', scheme.operator)
  setText(doc, 'scheme-confirm-contact-email', scheme.contactEmail)
  setText(doc, 'scheme-confirm-web-address', scheme.webAddress)
}

const applyProducerRouteGate = (doc, existing) => {
  const isIA = Boolean(existing.isIndustrial || existing.isAutomotive)
  const isPortableOnly = Boolean(
    existing.isPortable && !existing.isIndustrial && !existing.isAutomotive
  )

  const smallRadio = doc.querySelector(
    'input[name="producerRoute"][value="smallProducer"]'
  )
  const smallContainer = smallRadio?.closest('.govuk-radios__item') ?? null
  const directRadio = doc.querySelector(
    'input[name="producerRoute"][value="directRegistrant"]'
  )
  const directContainer = directRadio?.closest('.govuk-radios__item') ?? null
  const forcedDirectNotice = doc.querySelector('[data-testid="forced-direct"]')
  const forcedPortableNotice = doc.querySelector(
    '[data-testid="forced-portable-only"]'
  )

  if (isIA) {
    if (smallContainer) smallContainer.hidden = true
    if (smallRadio) smallRadio.checked = false
    if (forcedDirectNotice) forcedDirectNotice.hidden = false
    if (forcedPortableNotice) forcedPortableNotice.hidden = true
  } else if (isPortableOnly) {
    if (directContainer) directContainer.hidden = true
    if (directRadio) directRadio.checked = false
    if (forcedPortableNotice) forcedPortableNotice.hidden = false
    if (forcedDirectNotice) forcedDirectNotice.hidden = true
  } else {
    if (forcedDirectNotice) forcedDirectNotice.hidden = true
    if (forcedPortableNotice) forcedPortableNotice.hidden = true
  }
}
