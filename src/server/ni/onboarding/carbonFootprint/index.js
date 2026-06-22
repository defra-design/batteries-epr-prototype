import { paths } from '../../../../config/paths.js'
import { carbonFootprintController } from './controller.js'

export const carbonFootprint = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.niOnboardingCarbonFootprint,
      ...carbonFootprintController.get
    },
    {
      method: 'POST',
      path: paths.niOnboardingCarbonFootprint,
      ...carbonFootprintController.post
    }
  ]
}
