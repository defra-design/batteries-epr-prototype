import joi from 'joi'

import {
  BATTERY_CATEGORIES,
  categoryFlagName,
  categoryIds,
  CATEGORY_CAVEAT
} from '../../../config/battery-categories.js'
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

const flagNames = categoryIds.map(categoryFlagName)

const buildCategoryItems = (pageContent, formValues) =>
  BATTERY_CATEGORIES.map((category) => {
    const flag = categoryFlagName(category.id)
    return {
      value: 'on',
      text: pageContent[`${category.id}Label`],
      hint: { text: pageContent[`${category.id}Hint`] },
      name: flag,
      id: flag,
      checked: Boolean(formValues[flag])
    }
  })

const schema = joi
  .object(
    Object.fromEntries(flagNames.map((flag) => [flag, joi.any().optional()]))
  )
  .custom((value, helpers) => {
    const any = flagNames.some((flag) => Boolean(value[flag]))
    if (!any) return helpers.error('atLeastOne')
    return value
  })
  .messages({ atLeastOne: 'atLeastOne' })
  .options({ stripUnknown: true })

const truthy = (value) => value === 'on' || value === true || value === 'true'

const buildSavedFields = (payload) => ({
  batteryTypes: Object.fromEntries(
    flagNames.map((flag) => [flag, truthy(payload[flag])])
  )
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
    categoryItems: buildCategoryItems(pageContent, viewModel.formValues),
    firstFlag: flagNames[0],
    caveat: CATEGORY_CAVEAT,
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
          pagePayload: buildHydrationPayload(request, STEP_ID, {
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
            { text: pageContent.error.atLeastOne, href: `#${flagNames[0]}` }
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
            request,
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
