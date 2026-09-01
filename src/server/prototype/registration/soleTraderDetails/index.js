import { paths } from '../../../../config/paths.js'
import { soleTraderDetailsController } from './controller.js'

export const soleTraderDetails = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegistrationSoleTraderDetails,
      ...soleTraderDetailsController.get
    },
    {
      method: 'POST',
      path: paths.prototypeRegistrationSoleTraderDetails,
      ...soleTraderDetailsController.post
    }
  ]
}
