import { paths } from '../../../config/paths.js'
import { obligationController } from './controller.js'

export const complianceSchemeObligation = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.complianceSchemeObligation,
      ...obligationController
    }
  ]
}
