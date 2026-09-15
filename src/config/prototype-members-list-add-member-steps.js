import { paths } from './paths.js'

export const PROTOTYPE_MEMBERS_LIST_ADD_MEMBER_STEPS = [
  {
    id: 'organisationType',
    path: paths.prototypeMembersListAddMemberOrganisationType
  },
  {
    id: 'companiesHouse',
    path: paths.prototypeMembersListAddMemberCompaniesHouse,
    next: 'legalNoticesAddress'
  },
  {
    id: 'partnershipDetails',
    path: paths.prototypeMembersListAddMemberPartnershipDetails,
    next: 'legalNoticesAddress'
  },
  {
    id: 'soleTraderDetails',
    path: paths.prototypeMembersListAddMemberSoleTraderDetails,
    next: 'legalNoticesAddress'
  },
  {
    id: 'ukBusinessPresence',
    path: paths.prototypeMembersListAddMemberUkBusinessPresence
  },
  {
    id: 'overseasDetails',
    path: paths.prototypeMembersListAddMemberOverseasDetails,
    next: 'legalNoticesAddress'
  },
  {
    id: 'overseasExit',
    path: paths.prototypeMembersListAddMemberOverseasCannotRegister
  },
  {
    id: 'legalNoticesAddress',
    path: paths.prototypeMembersListAddMemberLegalNoticesAddress
  },
  {
    id: 'appropriatePerson',
    path: paths.prototypeMembersListAddMemberAppropriatePerson
  },
  {
    id: 'batteryCategory',
    path: paths.prototypeMembersListAddMemberBatteryCategory
  },
  { id: 'tonnage', path: paths.prototypeMembersListAddMemberTonnage },
  { id: 'dateJoined', path: paths.prototypeMembersListAddMemberDateJoined },
  {
    id: 'checkAnswers',
    path: paths.prototypeMembersListAddMemberCheckAnswers
  }
]

export const findStep = (id) =>
  PROTOTYPE_MEMBERS_LIST_ADD_MEMBER_STEPS.find((s) => s.id === id)

export const nextStepPath = (id) => {
  const idx = PROTOTYPE_MEMBERS_LIST_ADD_MEMBER_STEPS.findIndex(
    (s) => s.id === id
  )
  if (idx < 0) return null
  const step = PROTOTYPE_MEMBERS_LIST_ADD_MEMBER_STEPS[idx]
  if (step.next) return findStep(step.next).path
  return PROTOTYPE_MEMBERS_LIST_ADD_MEMBER_STEPS[idx + 1]?.path ?? null
}
