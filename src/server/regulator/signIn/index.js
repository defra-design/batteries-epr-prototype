import { paths } from '../../../config/paths.js'
import { signInController } from './controller.js'

export const regulatorSignIn = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.regulatorSignIn,
      ...signInController.get
    },
    {
      method: 'POST',
      path: paths.regulatorSignIn,
      ...signInController.post
    }
  ]
}
