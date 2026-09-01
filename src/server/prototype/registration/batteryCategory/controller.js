import joi from 'joi'

import { paths } from '../../../../config/paths.js'
import { prototypeRegistrationContent } from '../../../../config/prototype-registration-content.js'
import {
  basePageModel,
  buildHydrationPayload,
  buildStepPayload,
  errorListToMap,
  flashStepErrors,
  readStepErrors,
  returnUrlFromRequest,
  actionWithReturn
} from '../shared.js'

const STEP_ID = 'batteryCategory'

const FLAG_NAMES = ['isPortable', 'isIndustrial', 'isAutomotive']

const schema = joi
  .object(
    Object.fromEntries(FLAG_NAMES.map((flag) => [flag, joi.any().optional()]))
  )
  .custom((value, helpers) => {
    const any = FLAG_NAMES.some((flag) => Boolean(value[flag]))
    if (!any) return helpers.error('atLeastOne')
    return value
  })
  .messages({ atLeastOne: 'atLeastOne' })
  .options({ stripUnknown: true })

const truthy = (value) => value === 'on' || value === true || value === 'true'

const renderView = (h, pageContent, action, viewModel) =>
  h.view('prototype/registration/batteryCategory/view', {
    ...basePageModel(pageContent),
    errorTitle: pageContent.error.title,
    action,
    ...viewModel
  })

export const batteryCategoryController = {
  get: {
    handler(request, h) {
      const pageContent = prototypeRegistrationContent.batteryCategory
      const { errors, values } = readStepErrors(request, STEP_ID)
      const returnUrl = returnUrlFromRequest(request)

      return renderView(
        h,
        pageContent,
        actionWithReturn(paths.prototypeRegistrationBatteryCategory, returnUrl),
        {
          errorSummary: errors || [],
          errors: errorListToMap(errors),
          formValues: values || {},
          backLink: paths.prototypeRegistrationSignIn,
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
          const pageContent = prototypeRegistrationContent.batteryCategory
          const list = [
            { text: pageContent.error.atLeastOne, href: `#${FLAG_NAMES[0]}` }
          ]
          flashStepErrors(request, STEP_ID, list, request.payload)
          const returnUrl = returnUrlFromRequest(request)
          return h
            .redirect(
              actionWithReturn(
                paths.prototypeRegistrationBatteryCategory,
                returnUrl
              )
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const pageContent = prototypeRegistrationContent.batteryCategory
      const returnUrl = returnUrlFromRequest(request)
      const savedFields = Object.fromEntries(
        FLAG_NAMES.map((flag) => [flag, truthy(request.payload[flag])])
      )
      const exitOverride = savedFields.isPortable
        ? null
        : paths.prototypeRegistrationDifferentService

      return renderView(
        h,
        pageContent,
        actionWithReturn(paths.prototypeRegistrationBatteryCategory, returnUrl),
        {
          errorSummary: [],
          errors: {},
          formValues: request.payload,
          backLink: paths.prototypeRegistrationSignIn,
          pagePayload: buildStepPayload(
            STEP_ID,
            'draft',
            savedFields,
            exitOverride || returnUrl
          )
        }
      )
    }
  }
}
