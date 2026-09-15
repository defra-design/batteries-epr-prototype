import { createRequire } from 'node:module'

import { paths } from '../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'
import { taskFlowPageModel } from '../shared.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

const NEEDS_ATTENTION_STATUS = 'pendingReview'

const buildRows = (pageContent) =>
  seedData.prototypeComplianceSchemeMembers.map((member) => {
    const needsAttention = member.status === NEEDS_ATTENTION_STATUS
    return {
      id: member.id,
      companyName: member.companyName,
      statusText: needsAttention
        ? pageContent.needsAttentionStatus
        : pageContent.validStatus,
      needsAttention,
      fixUrl: paths.prototypeMembersListReviewUploadFix.replace(
        '{memberId}',
        member.id
      )
    }
  })

export const reviewUploadController = {
  get: {
    handler(_request, h) {
      const pageContent =
        prototypeComplianceSchemeContent.membersList.reviewUpload

      return h.view(
        'prototype/complianceScheme/membersList/reviewUpload/view',
        {
          ...taskFlowPageModel(pageContent),
          backLink: paths.prototypeMembersListUploadCsv,
          addOneMemberUrl: paths.prototypeMembersListAddMemberOrganisationType,
          bulkUploadUrl: paths.prototypeMembersListUploadCsv,
          submitAction: paths.prototypeMembersListReviewUpload,
          rows: buildRows(pageContent),
          pagePayload: { step: 'reviewUpload', target: 'hydrate' }
        }
      )
    }
  },

  post: {
    handler(_request, h) {
      const pageContent =
        prototypeComplianceSchemeContent.membersList.reviewUpload

      return h.view(
        'prototype/complianceScheme/membersList/reviewUpload/view',
        {
          ...taskFlowPageModel(pageContent),
          backLink: paths.prototypeMembersListUploadCsv,
          addOneMemberUrl: paths.prototypeMembersListAddMemberOrganisationType,
          bulkUploadUrl: paths.prototypeMembersListUploadCsv,
          submitAction: paths.prototypeMembersListReviewUpload,
          rows: buildRows(pageContent),
          pagePayload: {
            target: 'submit',
            nextStep: paths.prototypeMembersListSubmitted
          }
        }
      )
    }
  }
}
