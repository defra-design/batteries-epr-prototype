import { buildNavigation } from './build-navigation.js'
import { paths } from '../../paths.js'

describe('buildNavigation', () => {
  test('returns five navigation items in the expected order', () => {
    const navigation = buildNavigation()
    expect(navigation.map((item) => item.text)).toEqual([
      'Public register',
      'Compliance scheme',
      'Sign in',
      'Manage account',
      'Sign out'
    ])
  })

  test('compliance scheme is always visible', () => {
    const navigation = buildNavigation()
    const item = navigation.find((i) => i.text === 'Compliance scheme')
    expect(item.href).toBe(paths.complianceSchemeDashboard)
    expect(item.attributes['data-auth-state']).toBe('always')
  })

  test('public register is always visible', () => {
    const [item] = buildNavigation()
    expect(item.href).toBe(paths.publicRegisterSearch)
    expect(item.attributes['data-auth-state']).toBe('always')
  })

  test('sign in is marked as signed-out only', () => {
    const navigation = buildNavigation()
    const signIn = navigation.find((i) => i.text === 'Sign in')
    expect(signIn.href).toBe(paths.signIn)
    expect(signIn.attributes['data-auth-state']).toBe('signed-out')
  })

  test('manage account and sign out are marked signed-in only', () => {
    const navigation = buildNavigation()
    const account = navigation.find((i) => i.text === 'Manage account')
    const signOut = navigation.find((i) => i.text === 'Sign out')
    expect(account.href).toBe(paths.account)
    expect(account.attributes['data-auth-state']).toBe('signed-in')
    expect(signOut.href).toBe(paths.signOut)
    expect(signOut.attributes['data-auth-state']).toBe('signed-in')
  })

  test('every item carries a data-testid attribute for tests', () => {
    const navigation = buildNavigation()
    for (const item of navigation) {
      expect(item.attributes['data-testid']).toMatch(/^nav-/)
    }
  })
})
