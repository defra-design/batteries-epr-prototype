import joi from 'joi'

import { niContent } from '../../../../config/ni-content.js'
import { paths } from '../../../../config/paths.js'
import { getCompliancePeriod } from '../../../../config/compliance-period.js'
import {
  collectErrors,
  errorListToMap,
  flashErrors,
  nextStepPath,
  readData,
  readErrors,
  saveData
} from '../shared.js'

const STEP_ID = 'placedOnMarket'
const FIELDS = [
  'pomPortable',
  'pomLmt',
  'pomIndustrial',
  'pomEv',
  'pomAutomotive'
]

const tonnes = joi.number().min(0).allow('')

const schema = joi
  .object({
    pomPortable: tonnes,
    pomLmt: tonnes,
    pomIndustrial: tonnes,
    pomEv: tonnes,
    pomAutomotive: tonnes
  })
  .custom((value, helpers) => {
    const total = FIELDS.reduce((sum, field) => sum + (Number(value[field]) || 0), 0)
    if (total <= 0) return helpers.error('atLeastOne')
    return value
  })
  .messages({ atLeastOne: 'atLeastOne' })
  .options({ stripUnknown: true })

export const placedOnMarketController = {
  get: {
    handler(request, h) {
      const pageContent = niContent.annualReturn.placedOnMarket
      const { errorSummary, values } = readErrors(request, STEP_ID)
      const saved = readData(request).placedOnMarket ?? {}

      return h.view('ni/annualReturn/placedOnMarket/view', {
        pageTitle: pageContent.title,
        caption: `Annual return ${getCompliancePeriod(request)}`,
        heading: pageContent.heading,
        intro: pageContent.intro,
        labels: pageContent,
        errorTitle: pageContent.error.title,
        action: paths.niAnnualReturnPlaced,
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
        options: { abortEarly: false, stripUnknown: true },
        failAction: (request, h, err) => {
          const pageContent = niContent.annualReturn.placedOnMarket
          const list = collectErrors(err, {
            pomPortable: pageContent.error.number,
            pomLmt: pageContent.error.number,
            pomIndustrial: pageContent.error.number,
            pomEv: pageContent.error.number,
            pomAutomotive: pageContent.error.number
          })
          if (!list.length && err.details.some((d) => d.type === 'atLeastOne')) {
            list.push({ text: pageContent.error.atLeastOne, href: '#pomPortable' })
          }
          flashErrors(request, STEP_ID, list, request.payload)
          return h.redirect(paths.niAnnualReturnPlaced).takeover()
        }
      }
    },
    handler(request, h) {
      saveData(request, { placedOnMarket: request.payload })
      return h.redirect(nextStepPath(STEP_ID))
    }
  }
}
