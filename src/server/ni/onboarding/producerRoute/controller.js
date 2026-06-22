import joi from 'joi'

import { niContent } from '../../../../config/ni-content.js'
import { paths } from '../../../../config/paths.js'
import {
  errorListToMap,
  flashErrors,
  nextStepPath,
  readData,
  readErrors,
  saveData
} from '../shared.js'

const STEP_ID = 'producerRoute'

const schema = joi.object({
  producerRoute: joi.string().valid('self', 'pro').required()
})

export const producerRouteController = {
  get: {
    handler(request, h) {
      const pageContent = niContent.onboarding.producerRoute
      const { errorSummary, values } = readErrors(request, STEP_ID)
      const saved = readData(request).producerRoute ?? {}

      return h.view('ni/onboarding/producerRoute/view', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        intro: pageContent.intro,
        labels: pageContent,
        errorTitle: pageContent.error.title,
        action: paths.niOnboardingProducerRoute,
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
        options: { stripUnknown: true },
        failAction: (request, h, _err) => {
          const pageContent = niContent.onboarding.producerRoute
          const list = [
            { text: pageContent.error.choice, href: '#producerRoute' }
          ]
          flashErrors(request, STEP_ID, list, request.payload)
          return h.redirect(paths.niOnboardingProducerRoute).takeover()
        }
      }
    },
    handler(request, h) {
      saveData(request, { producerRoute: request.payload })
      return h.redirect(nextStepPath(STEP_ID))
    }
  }
}
