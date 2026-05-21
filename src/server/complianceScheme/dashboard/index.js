import { paths } from '../../../config/paths.js'
import { dashboardController } from './controller.js'

export const complianceSchemeDashboard = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.complianceSchemeDashboard,
      ...dashboardController
    }
  ]
}
