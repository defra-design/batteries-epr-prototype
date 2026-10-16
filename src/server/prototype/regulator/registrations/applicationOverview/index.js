import { paths } from '../../../../../config/paths.js'
import { applicationOverviewController } from './controller.js'

export const applicationOverview = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorApplication,
      ...applicationOverviewController.get
    },
    {
      method: 'POST',
      path: paths.prototypeRegulatorApplication,
      ...applicationOverviewController.post
    }
  ]
}
