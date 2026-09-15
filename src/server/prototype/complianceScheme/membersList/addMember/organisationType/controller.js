import { paths } from '../../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../../config/prototype-compliance-scheme-content.js'
import { createRadioStepController } from '../radio-step.js'

const DETAIL_PAGES = {
  limitedCompany: paths.prototypeMembersListAddMemberCompaniesHouse,
  llp: paths.prototypeMembersListAddMemberCompaniesHouse,
  partnership: paths.prototypeMembersListAddMemberPartnershipDetails,
  soleTrader: paths.prototypeMembersListAddMemberSoleTraderDetails,
  overseas: paths.prototypeMembersListAddMemberUkBusinessPresence
}

export const organisationTypeController = createRadioStepController({
  stepId: 'organisationType',
  path: paths.prototypeMembersListAddMemberOrganisationType,
  viewName:
    'prototype/complianceScheme/membersList/addMember/organisationType/view',
  pageContent:
    prototypeComplianceSchemeContent.membersList.addMember.organisationType,
  fieldName: 'organisationType',
  validValues: Object.keys(DETAIL_PAGES),
  backLink: paths.prototypeMembersListHowToSend,
  overrideFor: (value) => DETAIL_PAGES[value]
})
