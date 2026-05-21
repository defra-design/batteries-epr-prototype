import { paths } from '../../../config/paths.js'
import { iaController } from './controller.js'

export const complianceSchemeIa = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.complianceSchemeIa,
      ...iaController.get
    },
    {
      method: 'POST',
      path: paths.complianceSchemeIa,
      ...iaController.post
    }
  ]
}
