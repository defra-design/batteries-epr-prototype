import { paths } from '../../../../config/paths.js'
import { appropriatePersonGuidanceController } from './controller.js'

export const appropriatePersonGuidance = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegistrationAppropriatePersonGuidance,
      ...appropriatePersonGuidanceController
    }
  ]
}
