import { paths } from '../../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../../config/prototype-compliance-scheme-content.js'
import { createRadioStepController } from '../radio-step.js'

const NEXT_PAGES = {
  yes: paths.prototypeMembersListAddMemberOverseasDetails,
  no: paths.prototypeMembersListAddMemberOverseasCannotRegister
}

export const ukBusinessPresenceController = createRadioStepController({
  stepId: 'ukBusinessPresence',
  path: paths.prototypeMembersListAddMemberUkBusinessPresence,
  viewName:
    'prototype/complianceScheme/membersList/addMember/ukBusinessPresence/view',
  pageContent:
    prototypeComplianceSchemeContent.membersList.addMember.ukBusinessPresence,
  fieldName: 'ukBusinessPresence',
  validValues: ['yes', 'no'],
  backLink: paths.prototypeMembersListAddMemberOrganisationType,
  overrideFor: (value) => NEXT_PAGES[value]
})
