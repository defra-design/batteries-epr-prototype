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

const renderView = (h, request, viewModel) => {
  const pageContent = content.regulatorSignIn(request)
  return h.view('regulator/signIn/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    errorTitle: pageContent.error.title,
    action: paths.regulatorSignIn,
    cancelUrl: paths.home,
    ...viewModel
  })
}

export const signInController = {
  get: {
    handler(request, h) {
      return renderView(h, request, {
        errorSummary: [],
        errors: {},
        formValues: {},
        agencies: AGENCIES,
        pagePayload: { target: 'hydrate' }
      })
    }
  },
  post: {
    options: {
      validate: {
        payload: schema,
        failAction(request, h, _err) {
          const pageContent = content.regulatorSignIn(request)
          return renderView(h, request, {
            errorSummary: [
              { text: pageContent.error.choice, href: '#agencyCode' }
            ],
            errors: { agencyCode: pageContent.error.choice },
            formValues: request.payload,
            agencies: AGENCIES,
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
        agencies: AGENCIES,
        pagePayload: {
          target: 'setCurrentAgencyCode',
          agencyCode: request.payload.agencyCode,
          nextStep: paths.regulatorDashboard
        }
      })
    }
  }
}
