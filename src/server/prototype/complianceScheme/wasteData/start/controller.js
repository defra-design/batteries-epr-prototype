import joi from 'joi'

import { paths } from '../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'
import {
  buildHydrationPayload,
  buildSavePayload,
  errorListToMap,
  flashStepErrors,
  readStepErrors,
  taskFlowPageModel
} from '../shared.js'

const STEP_ID = 'start'
const pageContent = () => prototypeComplianceSchemeContent.wasteData.start

const schema = joi
  .object({
    submitMethod: joi.string().valid('onScreen', 'csv').required()
  })
  .options({ stripUnknown: true })

const renderView = (h, viewModel) =>
  h.view('prototype/complianceScheme/wasteData/start/view', {
    ...taskFlowPageModel(pageContent()),
    errorTitle: pageContent().error.title,
    action: paths.prototypeWasteDataStart,
    backLink: paths.prototypeWasteDataAccountHome,
    ...viewModel
  })

export const startController = {
  get: {
    handler(request, h) {
      const { errors, values } = readStepErrors(request, STEP_ID)

      return renderView(h, {
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
        failAction: (request, h) => {
          flashStepErrors(
            request,
            STEP_ID,
            [{ text: pageContent().error.choice, href: '#submitMethod' }],
            request.payload
          )
          return h.redirect(paths.prototypeWasteDataStart).takeover()
        }
      }
    },
    handler(request, h) {
      const { submitMethod } = request.payload

      // Uploading a CSV file is a separate journey that is not built here.
      if (submitMethod === 'csv') {
        return h.redirect(paths.prototypeWasteDataUploadUnavailable)
      }

      return renderView(h, {
        errorSummary: [],
        errors: {},
        formValues: request.payload,
        pagePayload: buildSavePayload(
          STEP_ID,
          { submitMethod },
          paths.prototypeWasteDataEnter
        )
      })
    }
  }
}
