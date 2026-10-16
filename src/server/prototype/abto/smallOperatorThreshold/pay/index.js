import { paths } from '../../../../../config/paths.js'
import { payController } from './controller.js'

export const pay = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeAbtoThresholdPay,
      ...payController.get
    },
    {
      method: 'POST',
      path: paths.prototypeAbtoThresholdPay,
      ...payController.post
    }
  ]
}
