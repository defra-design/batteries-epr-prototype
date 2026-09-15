import { storage } from '../../../storage-adapter.js'
import { readPagePayload } from '../../../page-payload.js'
import { hydrateForm } from '../../../hydrate-form.js'
import { wireCompanySearch } from '../../registration/company-search.js'
import { wireAddressLookup } from '../../registration/address-lookup.js'
import { renderCheckAnswers } from './check-answers.js'

const ADDRESS_LOOKUP_STEPS = [
  'partnershipDetails',
  'soleTraderDetails',
  'overseasDetails'
]

export const runPrototypeMembersListAddMemberStep = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  if (!payload) return 'no-payload'

  if (payload.savedFields) {
    storage.savePrototypeMembersListAddMember(payload.savedFields)
    if (payload.nextStep) {
      loc.assign(payload.nextStep)
      return 'navigated'
    }
    return 'persisted'
  }

  const draft = storage.getPrototypeMembersListAddMember()
  const form = doc.querySelector('form')
  if (form && !payload.skipHydration) hydrateForm(form, draft)

  if (payload.step === 'companiesHouse') wireCompanySearch(doc)
  if (ADDRESS_LOOKUP_STEPS.includes(payload.step)) wireAddressLookup(doc)
  if (payload.step === 'checkAnswers') renderCheckAnswers(doc, draft)

  return payload.skipHydration ? 'preserved' : 'hydrated'
}
