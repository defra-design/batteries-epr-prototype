import { paths } from '../../../../config/paths.js'
import { paymentController } from './controller.js'

export const payment = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeSubmissionPayment,
      ...paymentController.get
    },
    {
      method: 'POST',
      path: paths.prototypeSubmissionPayment,
      ...paymentController.post
    }
  ]
}
