import { paths } from '../../../../config/paths.js'
import { brandNamesController } from './controller.js'

export const brandNames = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.niOnboardingBrandNames,
      ...brandNamesController.get
    },
    {
      method: 'POST',
      path: paths.niOnboardingBrandNames,
      ...brandNamesController.post
    }
  ]
}
