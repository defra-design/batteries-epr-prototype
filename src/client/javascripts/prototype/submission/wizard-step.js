import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'
import { hydrateForm } from '../../hydrate-form.js'
import { renderCheckAnswers } from '../registration/check-answers.js'
import { renderBrandConfirm, wireBrandAdd } from './brand-names.js'
import { wireDataTotals } from './data-totals.js'
import { renderCheckData } from './check-data.js'
import { renderPayment } from './payment.js'
import { renderPaymentConfirmed } from './confirmation.js'
import { renderAccountName } from './account.js'

const ACCOUNT_STEPS = ['account', 'tasks']

const persistAndNavigate = (payload, loc) => {
  if (payload.target === 'registration') {
    storage.savePrototypeRegistration(payload.savedFields)
  } else if (payload.savedFields) {
    storage.savePrototypeSubmission(payload.savedFields)
  }
  if (payload.target === 'submit') storage.submitPrototypeSubmission()
  if (payload.target === 'payment') storage.completePrototypeSubmissionPayment()
  if (payload.nextStep) {
    loc.assign(payload.nextStep)
    return 'navigated'
  }
  return 'persisted'
}

export const runPrototypeSubmissionStep = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  if (!payload) return 'no-payload'

  if (
    payload.savedFields ||
    payload.target === 'submit' ||
    payload.target === 'payment'
  ) {
    return persistAndNavigate(payload, loc)
  }

  const registration = storage.getPrototypeRegistration()
  const submission = storage.getPrototypeSubmission()
  const step = payload.step

  const form = doc.querySelector('form')
  if (form && !payload.skipHydration && step !== 'brandAdd') {
    hydrateForm(form, { ...registration, ...submission })
  }

  if (ACCOUNT_STEPS.includes(step)) renderAccountName(doc, registration)
  if (step === 'checkRegistration') renderCheckAnswers(doc, registration)
  if (step === 'brandAdd') wireBrandAdd(doc, submission)
  if (step === 'brandConfirm') renderBrandConfirm(doc, storage)
  if (step === 'data') wireDataTotals(doc)
  if (step === 'checkData') renderCheckData(doc, registration, submission)
  if (step === 'payment') renderPayment(doc, storage)
  if (step === 'paymentConfirmed') renderPaymentConfirmed(doc, submission)

  return payload.skipHydration ? 'preserved' : 'hydrated'
}
