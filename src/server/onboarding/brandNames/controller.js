import joi from 'joi'

import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import {
  actionWithReturn,
  buildHydrationPayload,
  buildStepPayload,
  errorListToMap,
  flashStepErrors,
  isAllowedReturn,
  readStepErrors
} from '../shared.js'

const STEP_ID = 'brandNames'

const splitBrands = (text) =>
  Array.from(
    new Set(
      String(text)
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
    )
  )

const schema = joi
  .object({ brandNamesText: joi.string().allow('').required() })
  .custom((value, helpers) => {
    const list = splitBrands(value.brandNamesText)
    if (list.length === 0) return helpers.error('atLeastOne')
    return value
  })
  .messages({ atLeastOne: 'atLeastOne' })
  .options({ stripUnknown: true })

const returnUrlFromRequest = (request) => {
  const value = request.query?.return
  return isAllowedReturn(value) ? value : null
}

const renderView = (h, pageContent, action, viewModel) =>
  h.view('onboarding/brandNames/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    errorTitle: pageContent.error.title,
    action,
    ...viewModel
  })

export const brandNamesController = {
  get: {
    handler(request, h) {
      const pageContent = content.onboardingBrandNames(request)
      const { errors, values } = readStepErrors(request, STEP_ID)
      const returnUrl = returnUrlFromRequest(request)

      return renderView(
        h,
        pageContent,
        actionWithReturn(paths.onboardingBrandNames, returnUrl),
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
        failAction: (request, h, _err) => {
          const pageContent = content.onboardingBrandNames(request)
          const list = [
            { text: pageContent.error.atLeastOne, href: '#brandNamesText' }
          ]
          flashStepErrors(request, STEP_ID, list, request.payload)
          const returnUrl = returnUrlFromRequest(request)
          return h
            .redirect(actionWithReturn(paths.onboardingBrandNames, returnUrl))
            .takeover()
        }
      }
    },
    handler(request, h) {
      const pageContent = content.onboardingBrandNames(request)
      const returnUrl = returnUrlFromRequest(request)
      const savedFields = {
        brandNames: splitBrands(request.payload.brandNamesText)
      }

      return renderView(
        h,
        pageContent,
        actionWithReturn(paths.onboardingBrandNames, returnUrl),
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
