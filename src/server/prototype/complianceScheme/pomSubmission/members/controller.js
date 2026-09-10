import { createRequire } from 'node:module'

import { paths } from '../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'
import { basePageModel } from '../shared.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

const STATUS_TAG_COLOUR = {
  active: 'green',
  pendingReview: 'yellow'
}

export const membersController = {
  handler(_request, h) {
    const pageContent = prototypeComplianceSchemeContent.members

    const members = seedData.prototypeComplianceSchemeMembers.map((member) => ({
      companyName: member.companyName,
      companyRegistrationNo: member.companyRegistrationNo,
      joinedOn: member.joinedOn,
      statusLabel: pageContent.statusLabels[member.status],
      statusColour: STATUS_TAG_COLOUR[member.status]
    }))

    return h.view('prototype/complianceScheme/pomSubmission/members/view', {
      ...basePageModel(
        pageContent,
        paths.prototypeComplianceSchemeSubmissionMembers
      ),
      members
    })
  }
}
