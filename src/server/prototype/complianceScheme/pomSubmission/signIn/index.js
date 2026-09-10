import { paths } from '../../../../../config/paths.js'
import { signInController } from './controller.js'

export const signIn = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeComplianceSchemeSubmissionSignIn,
      ...signInController.get
    },
    {
      method: 'POST',
      path: paths.prototypeComplianceSchemeSubmissionSignIn,
      ...signInController.post
    }
  ]
}
