import { paths } from '../../../config/paths.js'
import { signInController } from './controller.js'

export const operatorSignIn = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.operatorSignIn,
      ...signInController.get
    },
    {
      method: 'POST',
      path: paths.operatorSignIn,
      ...signInController.post
    }
  ]
}
