import { paths } from '../../paths.js'

export function buildNavigation(_request) {
  return [
    {
      text: 'Public register',
      href: paths.publicRegisterSearch,
      attributes: {
        'data-auth-state': 'always',
        'data-testid': 'nav-public-register'
      }
    },
    {
      text: 'Sign in',
      href: paths.signIn,
      attributes: {
        'data-auth-state': 'signed-out',
        'data-testid': 'nav-sign-in'
      }
    },
    {
      text: 'Manage account',
      href: paths.account,
      attributes: {
        'data-auth-state': 'signed-in',
        'data-testid': 'nav-account'
      }
    },
    {
      text: 'Sign out',
      href: paths.signOut,
      attributes: {
        'data-auth-state': 'signed-in',
        'data-testid': 'nav-sign-out'
      }
    }
  ]
}
