import { storage } from '../../../storage-adapter.js'
import { readPagePayload } from '../../../page-payload.js'
import { hydrateForm } from '../../../hydrate-form.js'
import { renderReviewUpload } from './review-upload.js'
import { renderSubmitted } from './submitted.js'

const mergeSavedFields = (fields) => {
  if (!fields.fixes) return fields
  const existingFixes = storage.getPrototypeMembersList().fixes ?? {}
  return { ...fields, fixes: { ...existingFixes, ...fields.fixes } }
}

export const runPrototypeMembersListStep = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  if (!payload) return 'no-payload'

  if (payload.savedFields || payload.target === 'submit') {
    if (payload.savedFields) {
      storage.savePrototypeMembersList(mergeSavedFields(payload.savedFields))
    }
    if (payload.target === 'submit') {
      storage.submitPrototypeMembersList()
    }
    if (payload.nextStep) {
      loc.assign(payload.nextStep)
      return 'navigated'
    }
    return 'persisted'
  }

  const draft = storage.getPrototypeMembersList()
  const form = doc.querySelector('form')
  if (form && !payload.skipHydration) hydrateForm(form, draft)

  if (payload.step === 'reviewUpload') renderReviewUpload(doc, draft)
  if (payload.step === 'submitted') renderSubmitted(doc, draft)

  return payload.skipHydration ? 'preserved' : 'hydrated'
}
