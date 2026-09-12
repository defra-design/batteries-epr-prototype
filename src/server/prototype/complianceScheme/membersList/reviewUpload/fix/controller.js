import joi from 'joi'
import { createRequire } from 'node:module'

import { paths } from '../../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../../config/prototype-compliance-scheme-content.js'
import { taskFlowPageModel } from '../../shared.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../../client/javascripts/storage-seed.json'
)

const schema = joi
  .object({ companyRegistrationNo: joi.string().trim().min(1).required() })
  .options({ stripUnknown: true })

const findMember = (memberId) =>
  seedData.prototypeComplianceSchemeMembers.find((m) => m.id === memberId)

const fixUrl = (memberId) =>
  paths.prototypeMembersListReviewUploadFix.replace('{memberId}', memberId)

const buildViewModel = (
  pageContent,
  member,
  { errorSummary = [], errors = {}, pagePayload = null } = {}
) => ({
  ...taskFlowPageModel(pageContent),
  backLink: paths.prototypeMembersListReviewUpload,
  action: fixUrl(member.id),
  caption: pageContent.captionTemplate.replace(
    '{companyName}',
    member.companyName
  ),
  errorTitle: pageContent.error.title,
  errorSummary,
  errors,
  pagePayload
})

export const fixController = {
  get: {
    handler(request, h) {
      const pageContent = prototypeComplianceSchemeContent.membersList.fix
      const member = findMember(request.params.memberId)

      return h.view(
        'prototype/complianceScheme/membersList/reviewUpload/fix/view',
        buildViewModel(pageContent, member)
      )
    }
  },

  post: {
    options: {
      validate: {
        payload: schema,
        failAction: (request, h, _err) => {
          const pageContent = prototypeComplianceSchemeContent.membersList.fix
          const member = findMember(request.params.memberId)
          const errorList = [
            { text: pageContent.error.message, href: '#companyRegistrationNo' }
          ]

          return h
            .view(
              'prototype/complianceScheme/membersList/reviewUpload/fix/view',
              buildViewModel(pageContent, member, {
                errorSummary: errorList,
                errors: { companyRegistrationNo: pageContent.error.message }
              })
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const pageContent = prototypeComplianceSchemeContent.membersList.fix
      const member = findMember(request.params.memberId)
      const { companyRegistrationNo } = request.payload

      return h.view(
        'prototype/complianceScheme/membersList/reviewUpload/fix/view',
        buildViewModel(pageContent, member, {
          pagePayload: {
            target: 'save',
            savedFields: {
              fixes: { [member.id]: { companyRegistrationNo } }
            },
            nextStep: paths.prototypeMembersListReviewUpload
          }
        })
      )
    }
  }
}
