import { paths } from '../../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../../config/prototype-compliance-scheme-content.js'
import { createRadioStepController } from '../radio-step.js'

export const tonnageController = createRadioStepController({
  stepId: 'tonnage',
  path: paths.prototypeMembersListAddMemberTonnage,
  viewName: 'prototype/complianceScheme/membersList/addMember/tonnage/view',
  pageContent: prototypeComplianceSchemeContent.membersList.addMember.tonnage,
  fieldName: 'tonnageBand',
  validValues: ['upTo1Tonne', 'over1Tonne'],
  backLink: paths.prototypeMembersListAddMemberBatteryCategory
})
