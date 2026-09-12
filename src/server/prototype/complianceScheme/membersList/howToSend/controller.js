import joi from 'joi'

import { paths } from '../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'
import { taskFlowPageModel } from '../shared.js'

const schema = joi
  .object({ sendMethod: joi.string().valid('onlineForm', 'csv').required() })
  .options({ stripUnknown: true })

const NEXT_STEP = {
  csv: paths.prototypeMembersListUploadCsv,
  onlineForm: paths.prototypeMembersListAddMember
}

const buildViewModel = (
  pageContent,
  { errorSummary = [], errors = {}, formValues = {}, pagePayload = null } = {}
) => ({
  ...taskFlowPageModel(pageContent),
  backLink: paths.prototypeMembersListStart,
  action: paths.prototypeMembersListHowToSend,
  errorTitle: pageContent.error.title,
  errorSummary,
  errors,
  formValues,
  pagePayload
})

export const howToSendController = {
  get: {
    handler(_request, h) {
      const pageContent = prototypeComplianceSchemeContent.membersList.howToSend

      return h.view(
        'prototype/complianceScheme/membersList/howToSend/view',
        buildViewModel(pageContent, {
          pagePayload: { step: 'howToSend', target: 'hydrate' }
        })
      )
    }
  },

  post: {
    options: {
      validate: {
        payload: schema,
        failAction: (request, h, _err) => {
          const pageContent =
            prototypeComplianceSchemeContent.membersList.howToSend
          const errorList = [
            { text: pageContent.error.message, href: '#sendMethod' }
          ]

          return h
            .view(
              'prototype/complianceScheme/membersList/howToSend/view',
              buildViewModel(pageContent, {
                errorSummary: errorList,
                errors: { sendMethod: pageContent.error.message },
                formValues: request.payload,
                pagePayload: {
                  step: 'howToSend',
                  target: 'hydrate',
                  skipHydration: true
                }
              })
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const pageContent = prototypeComplianceSchemeContent.membersList.howToSend
      const { sendMethod } = request.payload

      return h.view(
        'prototype/complianceScheme/membersList/howToSend/view',
        buildViewModel(pageContent, {
          formValues: request.payload,
          pagePayload: {
            target: 'save',
            savedFields: { sendMethod },
            nextStep: NEXT_STEP[sendMethod]
          }
        })
      )
    }
  }
}
