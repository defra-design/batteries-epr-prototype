import joi from 'joi'

import {
  actionWithReturn,
  basePageModel,
  buildHydrationPayload,
  buildStepPayload,
  errorListToMap,
  flashStepErrors,
  readStepErrors,
  returnUrlFromRequest
} from './shared.js'

export const createRadioStepController = ({
  stepId,
  path,
  viewName,
  pageContent,
  fieldName,
  validValues,
  backLink,
  overrideFor = () => null,
  extraViewModel = {}
}) => {
  const schema = joi
    .object({
      [fieldName]: joi
        .string()
        .valid(...validValues)
        .required()
    })
    .options({ stripUnknown: true })

  const renderView = (h, action, viewModel) =>
    h.view(viewName, {
      ...basePageModel(pageContent),
      errorTitle: pageContent.error.title,
      action,
      backLink,
      ...extraViewModel,
      ...viewModel
    })

  return {
    get: {
      handler(request, h) {
        const { errors, values } = readStepErrors(request, stepId)
        const returnUrl = returnUrlFromRequest(request)

        return renderView(h, actionWithReturn(path, returnUrl), {
          errorSummary: errors || [],
          errors: errorListToMap(errors),
          formValues: values || {},
          pagePayload: buildHydrationPayload(stepId, {
            skipHydration: !!errors
          })
        })
      }
    },

    post: {
      options: {
        validate: {
          payload: schema,
          failAction: (request, h, _err) => {
            const list = [
              { text: pageContent.error.choice, href: `#${fieldName}` }
            ]
            flashStepErrors(request, stepId, list, request.payload)
            const returnUrl = returnUrlFromRequest(request)
            return h.redirect(actionWithReturn(path, returnUrl)).takeover()
          }
        }
      },
      handler(request, h) {
        const value = request.payload[fieldName]
        const returnUrl = returnUrlFromRequest(request)
        const branchOverride = overrideFor(value)

        return renderView(h, actionWithReturn(path, returnUrl), {
          errorSummary: [],
          errors: {},
          formValues: request.payload,
          pagePayload: buildStepPayload(
            stepId,
            'draft',
            { [fieldName]: value },
            branchOverride || returnUrl
          )
        })
      }
    }
  }
}
