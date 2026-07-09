import { createRequire } from 'node:module'

import joi from 'joi'

import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'

const seedData = createRequire(import.meta.url)(
  '../../../client/javascripts/storage-seed.json'
)

const schema = joi
  .object({
    schemeId: joi.string().uuid().required()
  })
  .options({ stripUnknown: true })

const approvedSchemes = () =>
  seedData.schemes.filter((s) => s.approvalStatus === 'approved')

const renderView = (h, request, viewModel) => {
  const pageContent = content.complianceSchemeSignIn(request)
  return h.view('complianceScheme/signIn/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    errorTitle: pageContent.error.title,
    action: paths.complianceSchemeSignIn,
    cancelUrl: paths.home,
    registerUrl: paths.complianceSchemeRegister,
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
        schemes: approvedSchemes(),
        pagePayload: { target: 'hydrate' }
      })
    }
  },
  post: {
    options: {
      validate: {
        payload: schema,
        failAction(request, h, _err) {
          const pageContent = content.complianceSchemeSignIn(request)
          return renderView(h, request, {
            errorSummary: [
              { text: pageContent.error.choice, href: '#schemeId' }
            ],
            errors: { schemeId: pageContent.error.choice },
            formValues: request.payload,
            schemes: approvedSchemes(),
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
        schemes: approvedSchemes(),
        pagePayload: {
          target: 'setCurrentSchemeId',
          schemeId: request.payload.schemeId,
          nextStep: paths.complianceSchemeDashboard
        }
      })
    }
  }
}
