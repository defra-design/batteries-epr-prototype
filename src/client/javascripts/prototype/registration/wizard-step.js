import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'
import { hydrateForm } from '../../hydrate-form.js'
import { wireCompanySearch } from './company-search.js'
import { wireAddressLookup } from './address-lookup.js'
import { renderCheckAnswers } from './check-answers.js'
import { renderConfirmation } from './confirmation.js'

const ADDRESS_LOOKUP_STEPS = ['partnershipDetails', 'soleTraderDetails']

export const runPrototypeRegistrationStep = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  if (!payload) return 'no-payload'

  if (payload.savedFields || payload.target === 'submit') {
    if (payload.savedFields) {
      storage.savePrototypeRegistration(payload.savedFields)
    }
    if (payload.target === 'submit') {
      storage.submitPrototypeRegistration()
    }
    if (payload.nextStep) {
      loc.assign(payload.nextStep)
      return 'navigated'
    }
    return 'persisted'
  }

  const draft = storage.getPrototypeRegistration()
  const form = doc.querySelector('form')
  if (form && !payload.skipHydration) hydrateForm(form, draft)

  if (payload.step === 'companiesHouse') wireCompanySearch(doc)
  if (ADDRESS_LOOKUP_STEPS.includes(payload.step)) wireAddressLookup(doc)
  if (payload.step === 'checkAnswers') renderCheckAnswers(doc, draft)
  if (payload.step === 'complete') renderConfirmation(doc, draft)

  return payload.skipHydration ? 'preserved' : 'hydrated'
}
