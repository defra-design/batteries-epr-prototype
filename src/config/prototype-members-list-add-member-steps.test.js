import { paths } from './paths.js'
import {
  PROTOTYPE_MEMBERS_LIST_ADD_MEMBER_STEPS,
  findStep,
  nextStepPath
} from './prototype-members-list-add-member-steps.js'

describe('prototype members-list add-member steps', () => {
  test('every step has an id and a path under the add-member prefix', () => {
    for (const step of PROTOTYPE_MEMBERS_LIST_ADD_MEMBER_STEPS) {
      expect(step.id).toEqual(expect.any(String))
      expect(step.path).toEqual(
        expect.stringContaining(
          '/prototype/compliance-scheme/members-list/add-member'
        )
      )
    }
  })

  test('findStep returns the step by id', () => {
    expect(findStep('organisationType').path).toBe(
      paths.prototypeMembersListAddMemberOrganisationType
    )
  })

  test('findStep returns undefined for an unknown id', () => {
    expect(findStep('nope')).toBeUndefined()
  })

  test('nextStepPath follows array order by default', () => {
    expect(nextStepPath('legalNoticesAddress')).toBe(
      paths.prototypeMembersListAddMemberAppropriatePerson
    )
    expect(nextStepPath('appropriatePerson')).toBe(
      paths.prototypeMembersListAddMemberBatteryCategory
    )
    expect(nextStepPath('batteryCategory')).toBe(
      paths.prototypeMembersListAddMemberTonnage
    )
    expect(nextStepPath('tonnage')).toBe(
      paths.prototypeMembersListAddMemberDateJoined
    )
    expect(nextStepPath('dateJoined')).toBe(
      paths.prototypeMembersListAddMemberCheckAnswers
    )
  })

  test('nextStepPath honours an explicit next id for the branches that reconverge', () => {
    expect(nextStepPath('companiesHouse')).toBe(
      paths.prototypeMembersListAddMemberLegalNoticesAddress
    )
    expect(nextStepPath('partnershipDetails')).toBe(
      paths.prototypeMembersListAddMemberLegalNoticesAddress
    )
    expect(nextStepPath('soleTraderDetails')).toBe(
      paths.prototypeMembersListAddMemberLegalNoticesAddress
    )
    expect(nextStepPath('overseasDetails')).toBe(
      paths.prototypeMembersListAddMemberLegalNoticesAddress
    )
  })

  test('nextStepPath returns null for the last step', () => {
    expect(nextStepPath('checkAnswers')).toBeNull()
  })

  test('nextStepPath returns null for an unknown id', () => {
    expect(nextStepPath('nope')).toBeNull()
  })
})
