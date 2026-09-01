import joi from 'joi'

import { paths } from '../../../../config/paths.js'
import { prototypeSubmissionContent } from '../../../../config/prototype-submission-content.js'
import {
  basePageModel,
  buildHydrationPayload,
  buildStepPayload,
  collectErrors,
  errorListToMap,
  flashStepErrors,
  readStepErrors
} from '../shared.js'

const STEP_ID = 'data'

const weightSchema = joi
  .string()
  .trim()
  .pattern(/^\d*(\.\d+)?$/)
  .allow('')
  .optional()

const schema = joi
  .object({
    unit: joi.string().valid('kilograms', 'tonnes').required(),
    weightLeadAcid: weightSchema,
    weightNickelCadmium: weightSchema,
    weightOther: weightSchema
  })
  .options({ stripUnknown: true })

const renderView = (h, pageContent, viewModel) =>
  h.view('prototype/submission/data/view', {
    ...basePageModel(pageContent),
    errorTitle: pageContent.error.title,
    action: paths.prototypeSubmissionData,
    backLink: paths.prototypeSubmissionBrandConfirm,
    accountUrl: paths.prototypeSubmissionAccount,
    ...viewModel
  })

export const dataController = {
  get: {
    handler(request, h) {
      const pageContent = prototypeSubmissionContent.data
      const { errors, values } = readStepErrors(request, STEP_ID)

      return renderView(h, pageContent, {
        errorSummary: errors || [],
        errors: errorListToMap(errors),
        formValues: values || {},
        pagePayload: buildHydrationPayload(STEP_ID, {
          skipHydration: !!errors
        })
      })
    }
  },

  post: {
    options: {
      validate: {
        payload: schema,
        failAction: (request, h, err) => {
          const pageContent = prototypeSubmissionContent.data
          const list = collectErrors(err, {
            unit: pageContent.error.unit,
            weightLeadAcid: pageContent.error.weight,
            weightNickelCadmium: pageContent.error.weight,
            weightOther: pageContent.error.weight
          })
          flashStepErrors(request, STEP_ID, list, request.payload)
          return h.redirect(paths.prototypeSubmissionData).takeover()
        }
      }
    },
    handler(request, h) {
      const pageContent = prototypeSubmissionContent.data

      return renderView(h, pageContent, {
        errorSummary: [],
        errors: {},
        formValues: request.payload,
        pagePayload: buildStepPayload(STEP_ID, 'submission', {
          ...request.payload
        })
      })
    }
  }
}
