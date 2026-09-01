import { paths } from '../../../../config/paths.js'
import { partnershipDetailsController } from './controller.js'

export const partnershipDetails = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegistrationPartnershipDetails,
      ...partnershipDetailsController.get
    },
    {
      method: 'POST',
      path: paths.prototypeRegistrationPartnershipDetails,
      ...partnershipDetailsController.post
    }
  ]
}
