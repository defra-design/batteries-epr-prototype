import { paths } from '../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'
import { taskFlowPageModel } from '../shared.js'

const buildViewModel = (
  pageContent,
  { errorSummary = [], errors = {}, pagePayload = null } = {}
) => ({
  ...taskFlowPageModel(pageContent),
  backLink: paths.prototypeMembersListHowToSend,
  action: paths.prototypeMembersListUploadCsv,
  errorTitle: pageContent.error.title,
  errorSummary,
  errors,
  pagePayload
})

const hasFile = (file) => Boolean(file?.hapi?.filename)

export const uploadCsvController = {
  get: {
    handler(_request, h) {
      const pageContent = prototypeComplianceSchemeContent.membersList.uploadCsv

      return h.view(
        'prototype/complianceScheme/membersList/uploadCsv/view',
        buildViewModel(pageContent)
      )
    }
  },

  post: {
    options: {
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        allow: 'multipart/form-data',
        maxBytes: 10 * 1024 * 1024
      }
    },
    handler(request, h) {
      const pageContent = prototypeComplianceSchemeContent.membersList.uploadCsv

      if (!hasFile(request.payload?.membersFile)) {
        const errorList = [
          { text: pageContent.error.message, href: '#membersFile' }
        ]

        return h.view(
          'prototype/complianceScheme/membersList/uploadCsv/view',
          buildViewModel(pageContent, {
            errorSummary: errorList,
            errors: { membersFile: pageContent.error.message }
          })
        )
      }

      return h.view(
        'prototype/complianceScheme/membersList/uploadCsv/view',
        buildViewModel(pageContent, {
          pagePayload: {
            target: 'save',
            savedFields: {
              sendMethod: 'csv',
              uploadedFileName: request.payload.membersFile.hapi.filename
            },
            nextStep: paths.prototypeMembersListReviewUpload
          }
        })
      )
    }
  }
}
