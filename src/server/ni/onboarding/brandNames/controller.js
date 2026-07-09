import joi from 'joi'

import { niContent } from '../../../../config/ni-content.js'
import { paths } from '../../../../config/paths.js'
import {
  errorListToMap,
  flashErrors,
  nextStepPath,
  readData,
  readErrors,
  saveData
} from '../shared.js'

const STEP_ID = 'brandNames'

const parseBrandNames = (raw) =>
  String(raw ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

const schema = joi
  .object({
    brandNames: joi.string().allow('').optional()
  })
  .custom((value, helpers) => {
    if (parseBrandNames(value.brandNames).length === 0) {
      return helpers.error('atLeastOne')
    }
    return value
  })
  .messages({ atLeastOne: 'atLeastOne' })
  .options({ stripUnknown: true })

export const brandNamesController = {
  get: {
    handler(request, h) {
      const pageContent = niContent.onboarding.brandNames
      const { errorSummary, values } = readErrors(request, STEP_ID)
      const saved = readData(request).brandNames ?? {}
      const textareaValue = values ? values.brandNames : (saved.raw ?? '')

      return h.view('ni/onboarding/brandNames/view', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        intro: pageContent.intro,
        labels: pageContent,
        errorTitle: pageContent.error.title,
        action: paths.niOnboardingBrandNames,
        errorSummary,
        errors: errorListToMap(errorSummary),
        textareaValue
      })
    }
  },

  post: {
    options: {
      validate: {
        payload: schema,
        failAction: (request, h, _err) => {
          const pageContent = niContent.onboarding.brandNames
          const list = [
            { text: pageContent.error.atLeastOne, href: '#brandNames' }
          ]
          flashErrors(request, STEP_ID, list, request.payload)
          return h.redirect(paths.niOnboardingBrandNames).takeover()
        }
      }
    },
    handler(request, h) {
      const brandNames = parseBrandNames(request.payload.brandNames)
      saveData(request, {
        brandNames: { brandNames, raw: brandNames.join('\n') }
      })
      return h.redirect(nextStepPath(STEP_ID))
    }
  }
}
