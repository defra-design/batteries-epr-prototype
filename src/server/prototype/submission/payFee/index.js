import { paths } from '../../../../config/paths.js'
import { payFeeController } from './controller.js'

export const payFee = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeSubmissionPayFee,
      ...payFeeController
    }
  ]
}
