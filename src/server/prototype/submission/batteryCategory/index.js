import { paths } from '../../../../config/paths.js'
import { batteryCategoryController } from './controller.js'

export const batteryCategory = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeSubmissionBatteryCategory,
      ...batteryCategoryController.get
    },
    {
      method: 'POST',
      path: paths.prototypeSubmissionBatteryCategory,
      ...batteryCategoryController.post
    }
  ]
}
