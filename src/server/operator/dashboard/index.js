import { paths } from '../../../config/paths.js'
import { dashboardController } from './controller.js'

export const operatorDashboard = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.operatorDashboard,
      ...dashboardController
    }
  ]
}
