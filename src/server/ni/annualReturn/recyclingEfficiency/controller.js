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

const STEP_ID = 'recyclingEfficiency'

const percentage = joi.number().min(0).max(100).allow('')

const schema = joi
  .object({
    reLeadAcid: percentage,
    reLithium: percentage,
    reNickelCadmium: percentage
  })
  .options({ stripUnknown: true })

export const recyclingEfficiencyController = {
  get: {
    handler(request, h) {
      const pageContent = niContent.annualReturn.recyclingEfficiency
      const { errorSummary, values } = readErrors(request, STEP_ID)
      const saved = readData(request).recyclingEfficiency ?? {}

      return h.view('ni/annualReturn/recyclingEfficiency/view', {
        pageTitle: pageContent.title,
        caption: `Annual return ${getCompliancePeriod(request)}`,
        heading: pageContent.heading,
        intro: pageContent.intro,
        labels: pageContent,
        errorTitle: pageContent.error.title,
        action: paths.niAnnualReturnRecycling,
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
          const pageContent = niContent.annualReturn.recyclingEfficiency
          const list = collectErrors(err, {
            reLeadAcid: pageContent.error.percentage,
            reLithium: pageContent.error.percentage,
            reNickelCadmium: pageContent.error.percentage
          })
          flashErrors(request, STEP_ID, list, request.payload)
          return h.redirect(paths.niAnnualReturnRecycling).takeover()
        }
      }
    },
    handler(request, h) {
      saveData(request, { recyclingEfficiency: request.payload })
      return h.redirect(nextStepPath(STEP_ID))
    }
  }
}
