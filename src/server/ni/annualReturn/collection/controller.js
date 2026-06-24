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

const STEP_ID = 'collection'

const tonnes = joi.number().min(0).allow('')

const schema = joi
  .object({
    colPortable: tonnes,
    colLmt: tonnes,
    colIndustrial: tonnes,
    colEv: tonnes,
    colAutomotive: tonnes
  })
  .options({ stripUnknown: true })

export const collectionController = {
  get: {
    handler(request, h) {
      const pageContent = niContent.annualReturn.collection
      const { errorSummary, values } = readErrors(request, STEP_ID)
      const saved = readData(request).collection ?? {}

      return h.view('ni/annualReturn/collection/view', {
        pageTitle: pageContent.title,
        caption: `Annual return ${getCompliancePeriod(request)}`,
        heading: pageContent.heading,
        intro: pageContent.intro,
        labels: pageContent,
        errorTitle: pageContent.error.title,
        action: paths.niAnnualReturnCollection,
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
          const pageContent = niContent.annualReturn.collection
          const list = collectErrors(err, {
            colPortable: pageContent.error.number,
            colLmt: pageContent.error.number,
            colIndustrial: pageContent.error.number,
            colEv: pageContent.error.number,
            colAutomotive: pageContent.error.number
          })
          flashErrors(request, STEP_ID, list, request.payload)
          return h.redirect(paths.niAnnualReturnCollection).takeover()
        }
      }
    },
    handler(request, h) {
      saveData(request, { collection: request.payload })
      return h.redirect(nextStepPath(STEP_ID))
    }
  }
}
