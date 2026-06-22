import { paths } from '../../../config/paths.js'
import { niSignInController } from './controller.js'

export const niSignIn = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.niSignIn,
      ...niSignInController.get
    },
    {
      method: 'POST',
      path: paths.niSignIn,
      ...niSignInController.post
    }
  ]
}
