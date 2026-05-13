import { paths } from '../../../config/paths.js'
import { batteryTypesController } from './controller.js'

export const batteryTypes = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.onboardingBatteryTypes,
      ...batteryTypesController.get
    },
    {
      method: 'POST',
      path: paths.onboardingBatteryTypes,
      ...batteryTypesController.post
    }
  ]
}
