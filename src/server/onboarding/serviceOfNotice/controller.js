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

const STEP_ID = 'serviceOfNotice'

const schema = joi
  .object({
    sonChoice: joi
      .string()
      .valid('sameAsRegistered', 'differentAddress')
      .required(),
    sonLine1: joi.when('sonChoice', {
      is: 'differentAddress',
      then: joi.string().trim().min(1).required(),
      otherwise: joi.string().trim().allow('').optional()
    }),
    sonLine2: joi.string().trim().allow('').optional(),
    sonTown: joi.when('sonChoice', {
      is: 'differentAddress',
      then: joi.string().trim().min(1).required(),
      otherwise: joi.string().trim().allow('').optional()
    }),
    sonPostcode: joi.when('sonChoice', {
      is: 'differentAddress',
      then: joi
        .string()
        .trim()
        .pattern(/^[A-Z]{1,2}[0-9R][0-9A-Z]?\s*[0-9][A-Z]{2}$/i)
        .required(),
      otherwise: joi.string().trim().allow('').optional()
    })
  })
  .options({ stripUnknown: true })

const fieldMessages = (errorContent) => ({
  sonChoice: errorContent.choice,
  sonLine1: errorContent.line1,
  sonTown: errorContent.town,
  sonPostcode: errorContent.postcode
})

const orNull = (value) => value || null

const buildSavedFields = (payload) => {
  if (payload.sonChoice === 'sameAsRegistered') {
    return { serviceOfNoticeAddressSameAsRegistered: true }
  }
  return {
    serviceOfNoticeAddress: {
      line1: payload.sonLine1,
      line2: orNull(payload.sonLine2),
      line3: null,
      line4: null,
      town: payload.sonTown,
      postcode: payload.sonPostcode.toUpperCase().replace(/\s+/g, ' ').trim(),
      countryCode: 'GB'
    }
  }
}

const returnUrlFromRequest = (request) => {
  const value = request.query?.return
  return isAllowedReturn(value) ? value : null
}

const renderView = (h, pageContent, action, viewModel) =>
  h.view('onboarding/serviceOfNotice/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    errorTitle: pageContent.error.title,
    action,
    ...viewModel
  })

export const serviceOfNoticeController = {
  get: {
    handler(request, h) {
      const pageContent = content.onboardingServiceOfNotice(request)
      const { errors, values } = readStepErrors(request, STEP_ID)
      const returnUrl = returnUrlFromRequest(request)

      return renderView(
        h,
        pageContent,
        actionWithReturn(paths.onboardingServiceOfNotice, returnUrl),
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
          const pageContent = content.onboardingServiceOfNotice(request)
          const list = collectErrors(err, fieldMessages(pageContent.error))
          flashStepErrors(request, STEP_ID, list, request.payload)
          const returnUrl = returnUrlFromRequest(request)
          return h
            .redirect(
              actionWithReturn(paths.onboardingServiceOfNotice, returnUrl)
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const pageContent = content.onboardingServiceOfNotice(request)
      const returnUrl = returnUrlFromRequest(request)

      return renderView(
        h,
        pageContent,
        actionWithReturn(paths.onboardingServiceOfNotice, returnUrl),
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
