import { paths } from '../../../config/paths.js'
import { iaController, iaMemberController } from './controller.js'

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
    },
    {
      method: 'GET',
      path: paths.complianceSchemeIaMember,
      ...iaMemberController.get
    },
    {
      method: 'POST',
      path: paths.complianceSchemeIaMember,
      ...iaMemberController.post
    }
  ]
}
