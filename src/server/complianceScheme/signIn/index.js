import { paths } from '../../../config/paths.js'
import { signInController } from './controller.js'

export const complianceSchemeSignIn = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.complianceSchemeSignIn,
      ...signInController.get
    },
    {
      method: 'POST',
      path: paths.complianceSchemeSignIn,
      ...signInController.post
    }
  ]
}
