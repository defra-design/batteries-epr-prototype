import { paths } from '../../../config/paths.js'
import { annualReturnController } from './controller.js'

export const operatorAnnualReturn = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.operatorAnnualReturn,
      ...annualReturnController.get
    },
    {
      method: 'POST',
      path: paths.operatorAnnualReturn,
      ...annualReturnController.post
    }
  ]
}
