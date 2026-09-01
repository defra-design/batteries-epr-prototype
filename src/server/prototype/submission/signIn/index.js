import { paths } from '../../../../config/paths.js'
import { signInController } from './controller.js'

export const signIn = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeSubmissionSignIn,
      ...signInController.get
    },
    {
      method: 'POST',
      path: paths.prototypeSubmissionSignIn,
      ...signInController.post
    }
  ]
}
