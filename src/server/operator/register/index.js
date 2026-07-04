import { paths } from '../../../config/paths.js'
import { registerController } from './controller.js'

export const operatorRegister = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.operatorRegister,
      ...registerController.get
    },
    {
      method: 'POST',
      path: paths.operatorRegister,
      ...registerController.post
    }
  ]
}
