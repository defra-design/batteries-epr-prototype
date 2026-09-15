import { paths } from '../../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../../config/prototype-compliance-scheme-content.js'
import { basePageModel, buildHydrationPayload } from '../shared.js'

const STEP_ID = 'checkAnswers'

const changeUrl = (stepPath) =>
  `${stepPath}?return=${encodeURIComponent(paths.prototypeMembersListAddMemberCheckAnswers)}`

export const checkAnswersController = {
  handler(_request, h) {
    const pageContent =
      prototypeComplianceSchemeContent.membersList.addMember.checkAnswers

    return h.view(
      'prototype/complianceScheme/membersList/addMember/checkAnswers/view',
      {
        ...basePageModel(pageContent),
        backLink: paths.prototypeMembersListAddMemberDateJoined,
        // The declaration screen for this branch isn't built yet.
        continueUrl: '#',
        changeUrls: {
          organisationType: changeUrl(
            paths.prototypeMembersListAddMemberOrganisationType
          ),
          legalNoticesAddress: changeUrl(
            paths.prototypeMembersListAddMemberLegalNoticesAddress
          ),
          appropriatePerson: changeUrl(
            paths.prototypeMembersListAddMemberAppropriatePerson
          ),
          batteryCategory: changeUrl(
            paths.prototypeMembersListAddMemberBatteryCategory
          ),
          tonnage: changeUrl(paths.prototypeMembersListAddMemberTonnage),
          dateJoined: changeUrl(paths.prototypeMembersListAddMemberDateJoined)
        },
        pagePayload: buildHydrationPayload(STEP_ID)
      }
    )
  }
}
