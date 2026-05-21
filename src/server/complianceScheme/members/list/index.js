import { paths } from '../../../../config/paths.js'
import { listController } from './controller.js'

export const membersList = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.complianceSchemeMembers,
      ...listController
    }
  ]
}
