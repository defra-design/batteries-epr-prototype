import { paths } from '../../../config/paths.js'
import { confirmationController } from './controller.js'

export const leaveSchemeConfirmation = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.leaveSchemeConfirmation,
      ...confirmationController
    }
  ]
}
