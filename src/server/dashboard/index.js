import { paths } from '../../config/paths.js'
import { dashboardController } from './controller.js'

export const dashboard = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.dashboard,
      ...dashboardController
    }
  ]
}
