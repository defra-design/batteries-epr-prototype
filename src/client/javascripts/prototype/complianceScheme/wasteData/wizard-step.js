import { storage } from '../../../storage-adapter.js'
import { readPagePayload } from '../../../page-payload.js'
import { hydrateForm } from '../../../hydrate-form.js'
import { renderAccountHome } from './account-home.js'
import { renderCheck } from './check.js'
import { renderSubmitted } from './submitted.js'

const hasFigures = (draft) =>
  Boolean(draft.collectedTonnes && draft.deliveredTonnes)

export const runPrototypeWasteDataStep = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  if (!payload) return 'no-payload'

  if (payload.target === 'save') {
    storage.savePrototypeWasteData(payload.savedFields)
    loc.assign(payload.nextStep)
    return 'navigated'
  }

  if (payload.target === 'submit') {
    storage.submitPrototypeWasteData(payload.submission)
    loc.assign(payload.nextStep)
    return 'navigated'
  }

  const draft = storage.getPrototypeWasteData()

  // The check and declaration screens are meaningless without figures, and
  // the submitted screen without a submission: send the user back rather
  // than show an empty summary.
  if (['check', 'declaration'].includes(payload.step) && !hasFigures(draft)) {
    loc.assign(payload.enterUrl)
    return 'redirected'
  }
  if (payload.step === 'submitted' && draft.status !== 'submitted') {
    loc.assign(payload.accountHomeUrl)
    return 'redirected'
  }

  const form = doc.querySelector('form')
  if (form && !payload.skipHydration) hydrateForm(form, draft)

  if (payload.step === 'accountHome') renderAccountHome(doc, draft, payload)
  if (payload.step === 'check') renderCheck(doc, draft)
  if (payload.step === 'submitted') renderSubmitted(doc, draft, payload)

  return 'hydrated'
}
