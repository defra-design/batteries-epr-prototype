import { paths } from '../../../config/paths.js'
import { niDashboardController } from './controller.js'

export const niDashboard = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.niDashboard,
      ...niDashboardController
    }
  ]
}
