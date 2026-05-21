import { paths } from '../../../config/paths.js'
import { schemeConfirmController } from './controller.js'

export const schemeConfirm = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.onboardingSchemeConfirm,
      ...schemeConfirmController.get
    },
    {
      method: 'POST',
      path: paths.onboardingSchemeConfirm,
      ...schemeConfirmController.post
    }
  ]
}
