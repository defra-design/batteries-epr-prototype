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

const STEP_ID = 'checkData'

const schema = joi
  .object({
    declFirstName: joi.string().trim().required(),
    declLastName: joi.string().trim().required(),
    declRole: joi.string().trim().required(),
    acknowledged: joi.any().required()
  })
  .options({ stripUnknown: true })

const renderView = (h, pageContent, viewModel) =>
  h.view('prototype/submission/checkData/view', {
    ...basePageModel(pageContent),
    errorTitle: pageContent.error.title,
    action: paths.prototypeSubmissionCheckData,
    backLink: paths.prototypeSubmissionData,
    changeUrl: paths.prototypeSubmissionData,
    brandChangeUrl: paths.prototypeSubmissionBrandQuestion,
    ...viewModel
  })

export const checkDataController = {
  get: {
    handler(request, h) {
      const pageContent = prototypeSubmissionContent.checkData
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
          const pageContent = prototypeSubmissionContent.checkData
          const list = collectErrors(err, {
            declFirstName: pageContent.error.firstName,
            declLastName: pageContent.error.lastName,
            declRole: pageContent.error.role,
            acknowledged: pageContent.error.acknowledge
          })
          flashStepErrors(request, STEP_ID, list, request.payload)
          return h.redirect(paths.prototypeSubmissionCheckData).takeover()
        }
      }
    },
    handler(request, h) {
      const pageContent = prototypeSubmissionContent.checkData
      const { declFirstName, declLastName, declRole } = request.payload

      return renderView(h, pageContent, {
        errorSummary: [],
        errors: {},
        formValues: request.payload,
        pagePayload: buildStepPayload(STEP_ID, 'submit', {
          declFirstName,
          declLastName,
          declRole,
          acknowledged: true
        })
      })
    }
  }
}
