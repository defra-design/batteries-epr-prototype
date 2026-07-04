import joi from 'joi'

import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'

const AGENCIES = [
  { code: 'EA', name: 'Environment Agency' },
  { code: 'NRW', name: 'Natural Resources Wales' },
  { code: 'SEPA', name: 'Scottish Environment Protection Agency' },
  { code: 'NIEA', name: 'Northern Ireland Environment Agency' }
]

const schema = joi
  .object({
    agencyCode: joi.string().valid('EA', 'NRW', 'SEPA', 'NIEA').required()
  })
  .options({ stripUnknown: true })

const schemeDetailsUrl = paths.complianceSchemeApplication.replace(
  '{step}',
  'scheme-details'
)

const renderView = (h, request, viewModel) => {
  const pageContent = content.complianceSchemeRegister(request)
  return h.view('complianceScheme/register/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    errorTitle: pageContent.error.title,
    action: paths.complianceSchemeRegister,
    cancelUrl: paths.complianceSchemeSignIn,
    agencies: AGENCIES,
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
          const pageContent = content.complianceSchemeRegister(request)
          return renderView(h, request, {
            errorSummary: [
              { text: pageContent.error.choice, href: '#agencyCode' }
            ],
            errors: { agencyCode: pageContent.error.choice },
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
          agencyCode: request.payload.agencyCode,
          nextStep: schemeDetailsUrl
        }
      })
    }
  }
}
