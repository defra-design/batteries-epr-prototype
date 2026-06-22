import joi from 'joi'

import { niContent } from '../../../../config/ni-content.js'
import { paths } from '../../../../config/paths.js'
import { getCompliancePeriod } from '../../../../config/compliance-period.js'
import {
  errorListToMap,
  flashErrors,
  nextStepPath,
  readData,
  readErrors,
  saveData
} from '../shared.js'

const STEP_ID = 'categories'

const CATEGORY_FIELDS = [
  'isPortable',
  'isLmt',
  'isIndustrial',
  'isElectricVehicle',
  'isSli'
]

const truthy = (value) => value === 'on' || value === true || value === 'true'

const schema = joi
  .object({
    isPortable: joi.any().optional(),
    isLmt: joi.any().optional(),
    isIndustrial: joi.any().optional(),
    isElectricVehicle: joi.any().optional(),
    isSli: joi.any().optional()
  })
  .custom((value, helpers) => {
    if (!CATEGORY_FIELDS.some((field) => truthy(value[field]))) {
      return helpers.error('atLeastOne')
    }
    return value
  })
  .messages({ atLeastOne: 'atLeastOne' })
  .options({ stripUnknown: true })

const buildSaved = (payload) =>
  CATEGORY_FIELDS.reduce((acc, field) => {
    acc[field] = truthy(payload[field])
    return acc
  }, {})

export const categoriesController = {
  get: {
    handler(request, h) {
      const pageContent = niContent.annualReturn.categories
      const { errorSummary, values } = readErrors(request, STEP_ID)
      const saved = readData(request).categories ?? {}

      return h.view('ni/annualReturn/categories/view', {
        pageTitle: pageContent.title,
        caption: `Annual return ${getCompliancePeriod(request)}`,
        heading: pageContent.heading,
        intro: pageContent.intro,
        labels: pageContent,
        errorTitle: pageContent.error.title,
        action: paths.niAnnualReturnCategories,
        errorSummary,
        errors: errorListToMap(errorSummary),
        formValues: values ?? saved
      })
    }
  },

  post: {
    options: {
      validate: {
        payload: schema,
        failAction: (request, h, _err) => {
          const pageContent = niContent.annualReturn.categories
          const list = [
            { text: pageContent.error.atLeastOne, href: '#isPortable' }
          ]
          flashErrors(request, STEP_ID, list, request.payload)
          return h.redirect(paths.niAnnualReturnCategories).takeover()
        }
      }
    },
    handler(request, h) {
      saveData(request, { categories: buildSaved(request.payload) })
      return h.redirect(nextStepPath(STEP_ID))
    }
  }
}
