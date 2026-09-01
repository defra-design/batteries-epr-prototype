import { paths } from '../../../../config/paths.js'
import { tonnageController } from './controller.js'

export const tonnage = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegistrationTonnage,
      ...tonnageController.get
    },
    {
      method: 'POST',
      path: paths.prototypeRegistrationTonnage,
      ...tonnageController.post
    }
  ]
}
