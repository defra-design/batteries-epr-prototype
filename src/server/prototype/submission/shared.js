import { nextStepPath } from '../../../config/prototype-submission-steps.js'
import { PROTOTYPE_SUBMISSION_SERVICE_NAME } from '../../../config/prototype-submission-content.js'

export {
  actionWithReturn,
  buildHydrationPayload,
  collectErrors,
  errorListToMap,
  isAllowedReturn,
  returnUrlFromRequest
} from '../registration/shared.js'

const FLASH_KEY = (stepId) => `prototypeSubmissionErrors:${stepId}`
const VALUES_KEY = (stepId) => `prototypeSubmissionValues:${stepId}`

export const basePageModel = (pageContent) => ({
  pageTitle: pageContent.title,
  heading: pageContent.heading,
  labels: pageContent,
  serviceName: PROTOTYPE_SUBMISSION_SERVICE_NAME,
  navigation: []
})

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
  stepId,
  target,
  savedFields,
  nextStepOverride = null
) => ({
  step: stepId,
  target,
  savedFields,
  nextStep: nextStepOverride || nextStepPath(stepId)
})
