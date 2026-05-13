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

const STEP_ID = 'batteryTypes'

const schema = joi
  .object({
    isPortable: joi.any().optional(),
    isIndustrial: joi.any().optional(),
    isAutomotive: joi.any().optional()
  })
  .custom((value, helpers) => {
    const any =
      Boolean(value.isPortable) ||
      Boolean(value.isIndustrial) ||
      Boolean(value.isAutomotive)
    if (!any) return helpers.error('atLeastOne')
    return value
  })
  .messages({ atLeastOne: 'atLeastOne' })
  .options({ stripUnknown: true })

const truthy = (value) => value === 'on' || value === true || value === 'true'

const buildSavedFields = (payload) => ({
  batteryTypes: {
    isPortable: truthy(payload.isPortable),
    isIndustrial: truthy(payload.isIndustrial),
    isAutomotive: truthy(payload.isAutomotive)
  }
})

const returnUrlFromRequest = (request) => {
  const value = request.query?.return
  return isAllowedReturn(value) ? value : null
}

const renderView = (h, pageContent, action, viewModel) =>
  h.view('onboarding/batteryTypes/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    errorTitle: pageContent.error.title,
    action,
    ...viewModel
  })

export const batteryTypesController = {
  get: {
    handler(request, h) {
      const pageContent = content.onboardingBatteryTypes(request)
      const { errors, values } = readStepErrors(request, STEP_ID)
      const returnUrl = returnUrlFromRequest(request)

      return renderView(
        h,
        pageContent,
        actionWithReturn(paths.onboardingBatteryTypes, returnUrl),
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
          const pageContent = content.onboardingBatteryTypes(request)
          const list = [
            { text: pageContent.error.atLeastOne, href: '#isPortable' }
          ]
          flashStepErrors(request, STEP_ID, list, request.payload)
          const returnUrl = returnUrlFromRequest(request)
          return h
            .redirect(actionWithReturn(paths.onboardingBatteryTypes, returnUrl))
            .takeover()
        }
      }
    },
    handler(request, h) {
      const pageContent = content.onboardingBatteryTypes(request)
      const returnUrl = returnUrlFromRequest(request)

      return renderView(
        h,
        pageContent,
        actionWithReturn(paths.onboardingBatteryTypes, returnUrl),
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
