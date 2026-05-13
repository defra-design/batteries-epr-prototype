import { paths } from '../../../config/paths.js'
import { brandNamesController } from './controller.js'

export const brandNames = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.onboardingBrandNames,
      ...brandNamesController.get
    },
    {
      method: 'POST',
      path: paths.onboardingBrandNames,
      ...brandNamesController.post
    }
  ]
}
