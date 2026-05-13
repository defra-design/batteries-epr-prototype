import { paths } from '../../config/paths.js'
import { serviceChargeController } from './controller.js'

export const serviceCharge = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.serviceCharge,
      ...serviceChargeController
    }
  ]
}
