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

const STEP_ID = 'carbonFootprint'

const percentage = joi.number().min(0).max(100).allow('')

const schema = joi
  .object({
    carbonFootprintValue: joi.number().min(0).required(),
    performanceClass: joi.string().valid('A', 'B', 'C', 'D', 'E').required(),
    recycledCobalt: percentage.optional(),
    recycledLithium: percentage.optional(),
    recycledNickel: percentage.optional(),
    recycledLead: percentage.optional()
  })
  .options({ stripUnknown: true })

export const carbonFootprintController = {
  get: {
    handler(request, h) {
      const pageContent = niContent.onboarding.carbonFootprint
      const { errorSummary, values } = readErrors(request, STEP_ID)
      const saved = readData(request).carbonFootprint ?? {}

      return h.view('ni/onboarding/carbonFootprint/view', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        intro: pageContent.intro,
        labels: pageContent,
        errorTitle: pageContent.error.title,
        action: paths.niOnboardingCarbonFootprint,
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
          const pageContent = niContent.onboarding.carbonFootprint
          const list = collectErrors(err, {
            carbonFootprintValue: pageContent.error.value,
            performanceClass: pageContent.error.class,
            recycledCobalt: pageContent.error.percentage,
            recycledLithium: pageContent.error.percentage,
            recycledNickel: pageContent.error.percentage,
            recycledLead: pageContent.error.percentage
          })
          flashErrors(request, STEP_ID, list, request.payload)
          return h.redirect(paths.niOnboardingCarbonFootprint).takeover()
        }
      }
    },
    handler(request, h) {
      saveData(request, { carbonFootprint: request.payload })
      return h.redirect(nextStepPath(STEP_ID))
    }
  }
}
