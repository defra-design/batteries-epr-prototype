import {
  getPreRegistrationInvite,
  getSchemeWithMemberList,
  MEMBER_LIST_SCHEME_ID,
  resendPreRegistrationInvite,
  resetRegistrationsStore,
  savePreRegistrationInvite
} from './store.js'

describe('#registrationsStore', () => {
  beforeEach(() => {
    resetRegistrationsStore()
  })

  test('resending with no invite sent does nothing', () => {
    expect(resendPreRegistrationInvite()).toBeNull()
    expect(getPreRegistrationInvite()).toBeNull()
  })

  test('resending keeps the contact and refreshes the sent date', () => {
    savePreRegistrationInvite({ name: 'Ada', email: 'ada@example.org' })
    const resent = resendPreRegistrationInvite()

    expect(resent).toMatchObject({ name: 'Ada', email: 'ada@example.org' })
    expect(getPreRegistrationInvite()).toEqual(resent)
  })

  test('only the member-list scheme has a member list to review', () => {
    expect(getSchemeWithMemberList(MEMBER_LIST_SCHEME_ID).id).toBe(
      MEMBER_LIST_SCHEME_ID
    )
    expect(getSchemeWithMemberList('repic')).toBeNull()
  })
})
