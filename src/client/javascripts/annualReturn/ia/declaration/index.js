import { storage } from '../../../storage-adapter.js'
import { readPagePayload } from '../../../page-payload.js'
import { hydrateForm } from '../../../hydrate-form.js'
import { requireAuth } from '../../../auth-gate.js'
import {
  readActiveSubmission,
  upsertSubmission
} from '../persist-submission.js'
import { redirectIfSchemeRoute } from '../../scheme-represented-gate.js'

const declarationToFormValues = (submission) => {
  const declaration = submission?.declaration
  if (!declaration) return {}
  return {
    declarationFirstName: declaration.firstName,
    declarationLastName: declaration.lastName,
    declarationPosition: declaration.position,
    declarationConfirm: declaration.declaredAt ? 'yes' : ''
  }
}

const updateRegistrationOnSubmit = (registrationId) => {
  const registration = storage.getRegistration(registrationId)
  if (!registration) return
  storage.saveRegistration({ ...registration })
}

export const initIaDeclaration = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc) ?? {}
  const signInUrl = payload.signInUrl ?? '/sign-in'
  if (!requireAuth(signInUrl)) return false

  if (redirectIfSchemeRoute(payload.registrationId, loc)) {
    return 'redirected-to-scheme-represented'
  }

  if (payload.target === 'submission-submit') {
    upsertSubmission(payload.registrationId, payload.savedFields)
    updateRegistrationOnSubmit(payload.registrationId)
    if (payload.nextStep) {
      loc.assign(payload.nextStep)
      return 'navigated'
    }
    return 'persisted'
  }

  if (!payload.skipHydration) {
    const submission = readActiveSubmission(payload.registrationId)
    const values = declarationToFormValues(submission)
    const form = doc.querySelector('form')
    if (form) hydrateForm(form, values)
  }

  return 'hydrated'
}
