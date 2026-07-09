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

const isSchemeRoute = (request) => request.query?.route === 'complianceScheme'

const actionFor = (request) =>
  isSchemeRoute(request)
    ? `${paths.onboardingDeclaration}?route=complianceScheme`
    : paths.onboardingDeclaration

const variantFor = (request, pageContent) =>
  isSchemeRoute(request)
    ? { ...pageContent, ...pageContent.schemeOverrides }
    : pageContent

const renderView = (h, request, pageContent, viewModel) => {
  const labels = variantFor(request, pageContent)
  return h.view('onboarding/declaration/view', {
    pageTitle: labels.title,
    heading: labels.heading,
    intro: labels.intro,
    labels,
    errorTitle: labels.error.title,
    action: actionFor(request),
    ...viewModel
  })
}

export const declarationController = {
  get: {
    handler(request, h) {
      const pageContent = content.onboardingDeclaration(request)
      const { errors, values } = readStepErrors(request, STEP_ID)

      return renderView(h, request, pageContent, {
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
          return h.redirect(actionFor(request)).takeover()
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

      return renderView(h, request, pageContent, {
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
