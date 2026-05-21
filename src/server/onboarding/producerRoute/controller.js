import joi from 'joi'

import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import {
  buildHydrationPayload,
  buildStepPayload,
  errorListToMap,
  flashStepErrors,
  readStepErrors
} from '../shared.js'

const STEP_ID = 'producerRoute'

const schema = joi
  .object({
    producerRoute: joi
      .string()
      .valid('smallProducer', 'directRegistrant', 'complianceScheme')
      .required()
  })
  .options({ stripUnknown: true })

const renderView = (h, pageContent, viewModel) =>
  h.view('onboarding/producerRoute/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    errorTitle: pageContent.error.title,
    action: paths.onboardingProducerRoute,
    ...viewModel
  })

export const producerRouteController = {
  get: {
    handler(request, h) {
      const pageContent = content.onboardingProducerRoute(request)
      const { errors, values } = readStepErrors(request, STEP_ID)

      return renderView(h, pageContent, {
        errorSummary: errors || [],
        errors: errorListToMap(errors),
        formValues: values || {},
        pagePayload: buildHydrationPayload(request, STEP_ID, {
          skipHydration: !!errors
        })
      })
    }
  },

  post: {
    options: {
      validate: {
        payload: schema,
        failAction: (request, h, _err) => {
          const pageContent = content.onboardingProducerRoute(request)
          const list = [
            { text: pageContent.error.choice, href: '#producerRoute' }
          ]
          flashStepErrors(request, STEP_ID, list, request.payload)
          return h.redirect(paths.onboardingProducerRoute).takeover()
        }
      }
    },
    handler(request, h) {
      const pageContent = content.onboardingProducerRoute(request)
      const savedFields = { producerRoute: request.payload.producerRoute }
      const nextStepOverride =
        request.payload.producerRoute === 'complianceScheme'
          ? paths.onboardingSchemeSelect
          : null

      return renderView(h, pageContent, {
        errorSummary: [],
        errors: {},
        formValues: request.payload,
        pagePayload: buildStepPayload(
          request,
          STEP_ID,
          'registration',
          savedFields,
          nextStepOverride
        )
      })
    }
  }
}
