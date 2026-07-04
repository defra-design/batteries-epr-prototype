import joi from 'joi'

import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'

const schema = joi
  .object({
    schemeId: joi.string().uuid().required()
  })
  .options({ stripUnknown: true })

const operatorDetailsUrl = paths.operatorApplication.replace(
  '{step}',
  'operator-details'
)

const renderView = (h, request, viewModel) => {
  const pageContent = content.operatorRegister(request)
  return h.view('operator/register/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    errorTitle: pageContent.error.title,
    action: paths.operatorRegister,
    cancelUrl: paths.operatorSignIn,
    ...viewModel
  })
}

export const registerController = {
  get: {
    handler(request, h) {
      return renderView(h, request, {
        errorSummary: [],
        errors: {},
        formValues: {},
        pagePayload: { target: 'hydrate' }
      })
    }
  },
  post: {
    options: {
      validate: {
        payload: schema,
        failAction(request, h, _err) {
          const pageContent = content.operatorRegister(request)
          return renderView(h, request, {
            errorSummary: [
              { text: pageContent.error.choice, href: '#schemeId' }
            ],
            errors: { schemeId: pageContent.error.choice },
            formValues: request.payload,
            pagePayload: { target: 'hydrate' }
          }).takeover()
        }
      }
    },
    handler(request, h) {
      return renderView(h, request, {
        errorSummary: [],
        errors: {},
        formValues: request.payload,
        pagePayload: {
          target: 'create',
          schemeId: request.payload.schemeId,
          nextStep: operatorDetailsUrl
        }
      })
    }
  }
}
