import { paths } from '../../../../../config/paths.js'
import { cardPaymentController } from './controller.js'

export const cardPayment = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeAbtoThresholdCardPayment,
      ...cardPaymentController.get
    },
    {
      method: 'POST',
      path: paths.prototypeAbtoThresholdCardPayment,
      ...cardPaymentController.post
    }
  ]
}
