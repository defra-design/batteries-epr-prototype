import { paths } from '../../../../config/paths.js'
import { confirmationController } from './controller.js'

export const confirmation = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.annualReturnIaConfirmation,
      ...confirmationController
    }
  ]
}
