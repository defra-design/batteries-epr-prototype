import { paths } from '../../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../../config/prototype-compliance-scheme-content.js'
import { basePageModel } from '../shared.js'

export const overseasExitController = {
  handler(_request, h) {
    const pageContent =
      prototypeComplianceSchemeContent.membersList.addMember.overseasExit

    return h.view(
      'prototype/complianceScheme/membersList/addMember/overseasExit/view',
      {
        ...basePageModel(pageContent),
        changeAnswerUrl: paths.prototypeMembersListAddMemberUkBusinessPresence,
        backLink: paths.prototypeMembersListAddMemberUkBusinessPresence
      }
    )
  }
}
