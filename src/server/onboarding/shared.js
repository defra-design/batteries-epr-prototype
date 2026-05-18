import { nextStepPath } from '../../config/onboarding-steps.js'
import { getCompliancePeriod } from '../../config/compliance-period.js'

const FLASH_KEY = (stepId) => `onboardingErrors:${stepId}`
const VALUES_KEY = (stepId) => `onboardingValues:${stepId}`

export const flashStepErrors = (request, stepId, errors, values) => {
  request.yar.flash(FLASH_KEY(stepId), errors)
  request.yar.flash(VALUES_KEY(stepId), values)
}

export const readStepErrors = (request, stepId) => {
  const errors = request.yar.flash(FLASH_KEY(stepId))
  const valuesArr = request.yar.flash(VALUES_KEY(stepId))
  return {
    errors: errors.length ? errors : null,
    values: valuesArr[0] ?? null
  }
}

export const buildStepPayload = (
  request,
  stepId,
  target,
  savedFields,
  nextStepOverride = null
) => ({
  step: stepId,
  target,
  compliancePeriod: getCompliancePeriod(request),
  savedFields,
  nextStep: nextStepOverride || nextStepPath(stepId)
})

export const isAllowedReturn = (value) =>
  typeof value === 'string' && /^\/[A-Za-z0-9/_-]*$/.test(value)

export const actionWithReturn = (action, returnUrl) =>
  returnUrl ? `${action}?return=${encodeURIComponent(returnUrl)}` : action

export const buildHydrationPayload = (
  request,
  stepId,
  { skipHydration = false } = {}
) => ({
  step: stepId,
  target: 'hydrate',
  compliancePeriod: getCompliancePeriod(request),
  skipHydration
})

export const errorListToMap = (errorList) =>
  (errorList || []).reduce((acc, e) => {
    acc[e.href.replace(/^#/, '')] = e.text
    return acc
  }, {})

export const collectErrors = (joiError, fieldMessages) => {
  const seen = new Set()
  const list = []
  for (const detail of joiError.details) {
    const field = detail.path[0]
    if (seen.has(field)) continue
    seen.add(field)
    if (fieldMessages[field]) {
      list.push({ text: fieldMessages[field], href: `#${field}` })
    }
  }
  return list
}
