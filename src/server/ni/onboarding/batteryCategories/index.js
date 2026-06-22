import { paths } from '../../../../config/paths.js'
import { batteryCategoriesController } from './controller.js'

export const batteryCategories = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.niOnboardingBatteryCategories,
      ...batteryCategoriesController.get
    },
    {
      method: 'POST',
      path: paths.niOnboardingBatteryCategories,
      ...batteryCategoriesController.post
    }
  ]
}
