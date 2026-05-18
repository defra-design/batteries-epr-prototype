import joi from 'joi'

import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import {
  buildHydrationPayload,
  collectErrors,
  errorListToMap,
  flashStepErrors,
  readStepErrors
} from '../shared.js'
import {
  getCompliancePeriod,
  getCurrentDate
} from '../../../config/compliance-period.js'

const STEP_ID = 'declaration'

const schema = joi
  .object({
    declarationFirstName: joi.string().trim().min(1).required(),
    declarationLastName: joi.string().trim().min(1).required(),
    declarationPosition: joi.string().trim().min(1).required(),
    declarationConfirm: joi.string().valid('yes').required()
  })
  .options({ stripUnknown: true })

const fieldMessages = (errorContent) => ({
  declarationFirstName: errorContent.firstName,
  declarationLastName: errorContent.lastName,
  declarationPosition: errorContent.position,
  declarationConfirm: errorContent.confirm
})

const renderView = (h, pageContent, viewModel) =>
  h.view('onboarding/declaration/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    errorTitle: pageContent.error.title,
    action: paths.onboardingDeclaration,
    ...viewModel
  })

export const declarationController = {
  get: {
    handler(request, h) {
      const pageContent = content.onboardingDeclaration(request)
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
        failAction: (request, h, err) => {
          const pageContent = content.onboardingDeclaration(request)
          const list = collectErrors(err, fieldMessages(pageContent.error))
          flashStepErrors(request, STEP_ID, list, request.payload)
          return h.redirect(paths.onboardingDeclaration).takeover()
        }
      }
    },
    handler(request, h) {
      const pageContent = content.onboardingDeclaration(request)
      const declaration = {
        firstName: request.payload.declarationFirstName,
        lastName: request.payload.declarationLastName,
        position: request.payload.declarationPosition,
        declaredAt: getCurrentDate(request).toISOString()
      }

      return renderView(h, pageContent, {
        errorSummary: [],
        errors: {},
        formValues: request.payload,
        pagePayload: {
          step: STEP_ID,
          target: 'registration-and-submit',
          compliancePeriod: getCompliancePeriod(request),
          savedFields: { declaration },
          nextStep: paths.onboardingConfirmation
        }
      })
    }
  }
}
