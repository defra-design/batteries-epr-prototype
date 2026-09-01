import { paths } from './paths.js'

export const PROTOTYPE_SUBMISSION_STEPS = [
  { id: 'batteryCategory', path: paths.prototypeSubmissionBatteryCategory },
  { id: 'tonnage', path: paths.prototypeSubmissionTonnage },
  { id: 'checkRegistration', path: paths.prototypeSubmissionCheckRegistration },
  { id: 'brandQuestion', path: paths.prototypeSubmissionBrandQuestion },
  { id: 'brandAdd', path: paths.prototypeSubmissionBrandAdd },
  { id: 'brandConfirm', path: paths.prototypeSubmissionBrandConfirm },
  { id: 'data', path: paths.prototypeSubmissionData },
  { id: 'checkData', path: paths.prototypeSubmissionCheckData },
  { id: 'payFee', path: paths.prototypeSubmissionPayFee },
  { id: 'payment', path: paths.prototypeSubmissionPayment },
  { id: 'paymentConfirmed', path: paths.prototypeSubmissionPaymentConfirmed }
]

export const findStep = (id) =>
  PROTOTYPE_SUBMISSION_STEPS.find((s) => s.id === id)

export const nextStepPath = (id) => {
  const idx = PROTOTYPE_SUBMISSION_STEPS.findIndex((s) => s.id === id)
  if (idx < 0 || idx === PROTOTYPE_SUBMISSION_STEPS.length - 1) return null
  return PROTOTYPE_SUBMISSION_STEPS[idx + 1].path
}
