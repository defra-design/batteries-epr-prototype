import { paths } from '../../../../../config/paths.js'
import { schemeDashboardController } from './controller.js'

export const schemeDashboard = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorScheme,
      ...schemeDashboardController
    }
  ]
}
