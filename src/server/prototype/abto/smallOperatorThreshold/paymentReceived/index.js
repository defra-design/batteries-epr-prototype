import { paths } from '../../../../../config/paths.js'
import { paymentReceivedController } from './controller.js'

export const paymentReceived = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeAbtoThresholdPaymentReceived,
      ...paymentReceivedController
    }
  ]
}
