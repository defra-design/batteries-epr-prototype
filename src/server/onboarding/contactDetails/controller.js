import joi from 'joi'

import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import {
  actionWithReturn,
  buildHydrationPayload,
  buildStepPayload,
  collectErrors,
  errorListToMap,
  flashStepErrors,
  isAllowedReturn,
  readStepErrors
} from '../shared.js'

const STEP_ID = 'contactDetails'

const schema = joi
  .object({
    firstName: joi.string().trim().min(1).required(),
    lastName: joi.string().trim().min(1).required(),
    position: joi.string().trim().min(1).required(),
    phone: joi
      .string()
      .trim()
      .pattern(/^[\d\s+()-]{7,20}$/)
      .required(),
    email: joi.string().trim().email().required()
  })
  .options({ stripUnknown: true })

const fieldMessages = (errorContent) => ({
  firstName: errorContent.firstName,
  lastName: errorContent.lastName,
  position: errorContent.position,
  phone: errorContent.phone,
  email: errorContent.email
})

const buildSavedFields = (payload) => ({
  primaryContact: {
    firstName: payload.firstName,
    lastName: payload.lastName,
    position: payload.position,
    phone: payload.phone,
    email: payload.email
  }
})

const returnUrlFromRequest = (request) => {
  const value = request.query?.return
  return isAllowedReturn(value) ? value : null
}

const renderView = (h, pageContent, action, viewModel) =>
  h.view('onboarding/contactDetails/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    errorTitle: pageContent.error.title,
    action,
    ...viewModel
  })

export const contactDetailsController = {
  get: {
    handler(request, h) {
      const pageContent = content.onboardingContactDetails(request)
      const { errors, values } = readStepErrors(request, STEP_ID)
      const returnUrl = returnUrlFromRequest(request)

      return renderView(
        h,
        pageContent,
        actionWithReturn(paths.onboardingContactDetails, returnUrl),
        {
          errorSummary: errors || [],
          errors: errorListToMap(errors),
          formValues: values || {},
          pagePayload: buildHydrationPayload(STEP_ID, {
            skipHydration: !!errors
          })
        }
      )
    }
  },

  post: {
    options: {
      validate: {
        payload: schema,
        failAction: (request, h, err) => {
          const pageContent = content.onboardingContactDetails(request)
          const list = collectErrors(err, fieldMessages(pageContent.error))
          flashStepErrors(request, STEP_ID, list, request.payload)
          const returnUrl = returnUrlFromRequest(request)
          return h
            .redirect(
              actionWithReturn(paths.onboardingContactDetails, returnUrl)
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const pageContent = content.onboardingContactDetails(request)
      const returnUrl = returnUrlFromRequest(request)

      return renderView(
        h,
        pageContent,
        actionWithReturn(paths.onboardingContactDetails, returnUrl),
        {
          errorSummary: [],
          errors: {},
          formValues: request.payload,
          pagePayload: buildStepPayload(
            STEP_ID,
            'producer',
            buildSavedFields(request.payload),
            returnUrl
          )
        }
      )
    }
  }
}
