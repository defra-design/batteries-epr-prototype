import { paths } from '../../../../config/paths.js'
import { paymentConfirmedController } from './controller.js'

export const paymentConfirmed = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeSubmissionPaymentConfirmed,
      ...paymentConfirmedController
    }
  ]
}
