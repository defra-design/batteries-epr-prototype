import { paths } from '../../../../../config/paths.js'
import { signInController } from './controller.js'

export const signIn = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeComplianceSchemeQueryResponseSignIn,
      ...signInController.get
    },
    {
      method: 'POST',
      path: paths.prototypeComplianceSchemeQueryResponseSignIn,
      ...signInController.post
    }
  ]
}
