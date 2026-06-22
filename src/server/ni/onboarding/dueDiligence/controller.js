import joi from 'joi'

import { niContent } from '../../../../config/ni-content.js'
import { paths } from '../../../../config/paths.js'
import {
  collectErrors,
  errorListToMap,
  flashErrors,
  nextStepPath,
  readData,
  readErrors,
  saveData
} from '../shared.js'

const STEP_ID = 'dueDiligence'

const truthy = (value) => value === 'on' || value === true || value === 'true'

const schema = joi
  .object({
    aboveThreshold: joi.string().valid('yes', 'no').required(),
    policyConfirm: joi.when('aboveThreshold', {
      is: 'yes',
      then: joi.valid('on').required(),
      otherwise: joi.any().optional()
    }),
    verifiedConfirm: joi.any().optional(),
    policyReference: joi.string().allow('').optional()
  })
  .options({ stripUnknown: true })

const buildSaved = (payload) => ({
  aboveThreshold: payload.aboveThreshold,
  policyConfirm: truthy(payload.policyConfirm),
  verifiedConfirm: truthy(payload.verifiedConfirm),
  policyReference: payload.policyReference ?? ''
})

export const dueDiligenceController = {
  get: {
    handler(request, h) {
      const pageContent = niContent.onboarding.dueDiligence
      const { errorSummary, values } = readErrors(request, STEP_ID)
      const saved = readData(request).dueDiligence ?? {}

      return h.view('ni/onboarding/dueDiligence/view', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        intro: pageContent.intro,
        labels: pageContent,
        errorTitle: pageContent.error.title,
        action: paths.niOnboardingDueDiligence,
        errorSummary,
        errors: errorListToMap(errorSummary),
        formValues: values ?? saved
      })
    }
  },

  post: {
    options: {
      validate: {
        payload: schema,
        options: { abortEarly: false, stripUnknown: true },
        failAction: (request, h, err) => {
          const pageContent = niContent.onboarding.dueDiligence
          const list = collectErrors(err, {
            aboveThreshold: pageContent.error.threshold,
            policyConfirm: pageContent.error.policyConfirm
          })
          flashErrors(request, STEP_ID, list, request.payload)
          return h.redirect(paths.niOnboardingDueDiligence).takeover()
        }
      }
    },
    handler(request, h) {
      saveData(request, { dueDiligence: buildSaved(request.payload) })
      return h.redirect(nextStepPath(STEP_ID))
    }
  }
}
