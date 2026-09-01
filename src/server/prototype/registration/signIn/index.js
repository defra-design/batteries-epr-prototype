import { paths } from '../../../../config/paths.js'
import { signInController } from './controller.js'

export const signIn = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegistrationSignIn,
      ...signInController.get
    },
    {
      method: 'POST',
      path: paths.prototypeRegistrationSignIn,
      ...signInController.post
    }
  ]
}
