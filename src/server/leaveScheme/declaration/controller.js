import joi from 'joi'

import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'

const schema = joi
  .object({
    declarationConfirm: joi.string().valid('yes').required()
  })
  .options({ stripUnknown: true })

const renderView = (h, request, viewModel) => {
  const pageContent = content.leaveSchemeDeclaration(request)
  return h.view('leaveScheme/declaration/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    errorTitle: pageContent.error.title,
    action: paths.leaveSchemeDeclaration,
    backUrl: paths.leaveSchemeReason,
    accountUrl: paths.account,
    ...viewModel
  })
}

export const declarationController = {
  get: {
    handler(request, h) {
      return renderView(h, request, {
        errorSummary: [],
        errors: {},
        formValues: {},
        pagePayload: {
          step: 'leaveSchemeDeclaration',
          target: 'hydrate'
        }
      })
    }
  },
  post: {
    options: {
      validate: {
        payload: schema,
        failAction(request, h, _err) {
          const pageContent = content.leaveSchemeDeclaration(request)
          return renderView(h, request, {
            errorSummary: [
              { text: pageContent.error.confirm, href: '#declarationConfirm' }
            ],
            errors: { declarationConfirm: pageContent.error.confirm },
            formValues: request.payload,
            pagePayload: {
              step: 'leaveSchemeDeclaration',
              target: 'hydrate',
              skipHydration: true
            }
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
          step: 'leaveSchemeDeclaration',
          target: 'transition',
          nextStep: paths.leaveSchemeConfirmation
        }
      })
    }
  }
}
