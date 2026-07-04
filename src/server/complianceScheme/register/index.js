import { paths } from '../../../config/paths.js'
import { registerController } from './controller.js'

export const complianceSchemeRegister = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.complianceSchemeRegister,
      ...registerController.get
    },
    {
      method: 'POST',
      path: paths.complianceSchemeRegister,
      ...registerController.post
    }
  ]
}
