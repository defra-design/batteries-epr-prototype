import { paths } from '../../../config/paths.js'
import { dashboardController } from './controller.js'

export const regulatorDashboard = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.regulatorDashboard,
      ...dashboardController
    }
  ]
}
