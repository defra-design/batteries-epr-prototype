import { paths } from '../../../../config/paths.js'
import { batteryPassportController } from './controller.js'

export const batteryPassport = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.niOnboardingBatteryPassport,
      ...batteryPassportController.get
    },
    {
      method: 'POST',
      path: paths.niOnboardingBatteryPassport,
      ...batteryPassportController.post
    }
  ]
}
