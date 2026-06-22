import { paths } from '../../../../config/paths.js'
import { contactDetailsController } from './controller.js'

export const contactDetails = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.niOnboardingContactDetails,
      ...contactDetailsController.get
    },
    {
      method: 'POST',
      path: paths.niOnboardingContactDetails,
      ...contactDetailsController.post
    }
  ]
}
