import { paths } from '../../../../../config/paths.js'
import { signInController } from './controller.js'

export const signIn = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorWasteReturnsSignIn,
      ...signInController.get
    },
    {
      method: 'POST',
      path: paths.prototypeRegulatorWasteReturnsSignIn,
      ...signInController.post
    }
  ]
}
