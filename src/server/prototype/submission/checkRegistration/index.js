import { paths } from '../../../../config/paths.js'
import { checkRegistrationController } from './controller.js'

export const checkRegistration = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeSubmissionCheckRegistration,
      ...checkRegistrationController
    }
  ]
}
