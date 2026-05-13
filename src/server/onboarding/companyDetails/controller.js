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

const STEP_ID = 'companyDetails'

const schema = joi
  .object({
    companyRegistrationNo: joi
      .string()
      .trim()
      .pattern(/^\d{8}$/)
      .required(),
    companyName: joi.string().trim().min(1).required(),
    tradingName: joi.string().trim().allow('').optional(),
    webAddress: joi.string().trim().allow('').optional(),
    sicCode: joi.string().trim().allow('').optional(),
    line1: joi.string().trim().min(1).required(),
    line2: joi.string().trim().allow('').optional(),
    town: joi.string().trim().min(1).required(),
    postcode: joi
      .string()
      .trim()
      .pattern(/^[A-Z]{1,2}[0-9R][0-9A-Z]?\s*[0-9][A-Z]{2}$/i)
      .required()
  })
  .options({ stripUnknown: true })

const fieldMessages = (errorContent) => ({
  companyRegistrationNo: errorContent.companyRegistrationNo,
  companyName: errorContent.companyName,
  line1: errorContent.line1,
  town: errorContent.town,
  postcode: errorContent.postcode
})

const orNull = (value) => value || null

const buildSavedFields = (payload) => ({
  companyName: payload.companyName,
  tradingName: orNull(payload.tradingName),
  companyRegistrationNo: payload.companyRegistrationNo,
  webAddress: orNull(payload.webAddress),
  sicCode: orNull(payload.sicCode),
  registeredAddress: {
    line1: payload.line1,
    line2: orNull(payload.line2),
    line3: null,
    line4: null,
    town: payload.town,
    postcode: payload.postcode.toUpperCase().replace(/\s+/g, ' ').trim(),
    countryCode: 'GB'
  }
})

const returnUrlFromRequest = (request) => {
  const value = request.query?.return
  return isAllowedReturn(value) ? value : null
}

const renderView = (h, pageContent, action, viewModel) =>
  h.view('onboarding/companyDetails/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    errorTitle: pageContent.error.title,
    action,
    ...viewModel
  })

export const companyDetailsController = {
  get: {
    handler(request, h) {
      const pageContent = content.onboardingCompanyDetails(request)
      const { errors, values } = readStepErrors(request, STEP_ID)
      const returnUrl = returnUrlFromRequest(request)

      return renderView(
        h,
        pageContent,
        actionWithReturn(paths.onboardingCompanyDetails, returnUrl),
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
          const pageContent = content.onboardingCompanyDetails(request)
          const list = collectErrors(err, fieldMessages(pageContent.error))
          flashStepErrors(request, STEP_ID, list, request.payload)
          const returnUrl = returnUrlFromRequest(request)
          return h
            .redirect(
              actionWithReturn(paths.onboardingCompanyDetails, returnUrl)
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const pageContent = content.onboardingCompanyDetails(request)
      const savedFields = buildSavedFields(request.payload)
      const returnUrl = returnUrlFromRequest(request)

      return renderView(
        h,
        pageContent,
        actionWithReturn(paths.onboardingCompanyDetails, returnUrl),
        {
          errorSummary: [],
          errors: {},
          formValues: request.payload,
          pagePayload: buildStepPayload(
            STEP_ID,
            'producer',
            savedFields,
            returnUrl
          )
        }
      )
    }
  }
}
