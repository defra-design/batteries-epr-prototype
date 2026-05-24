import { createRequire } from 'node:module'

import joi from 'joi'

import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'

const seedData = createRequire(import.meta.url)(
  '../../../client/javascripts/storage-seed.json'
)

const schema = joi
  .object({
    operatorId: joi.string().uuid().required()
  })
  .options({ stripUnknown: true })

const approvedOperators = () =>
  seedData.operators.filter((o) => o.approvalStatus === 'approved')

const renderView = (h, request, viewModel) => {
  const pageContent = content.operatorSignIn(request)
  return h.view('operator/signIn/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    errorTitle: pageContent.error.title,
    action: paths.operatorSignIn,
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
        operators: approvedOperators(),
        pagePayload: { target: 'hydrate' }
      })
    }
  },
  post: {
    options: {
      validate: {
        payload: schema,
        failAction(request, h, _err) {
          const pageContent = content.operatorSignIn(request)
          return renderView(h, request, {
            errorSummary: [
              { text: pageContent.error.choice, href: '#operatorId' }
            ],
            errors: { operatorId: pageContent.error.choice },
            formValues: request.payload,
            operators: approvedOperators(),
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
        operators: approvedOperators(),
        pagePayload: {
          target: 'setCurrentOperatorId',
          operatorId: request.payload.operatorId,
          nextStep: paths.operatorDashboard
        }
      })
    }
  }
}
