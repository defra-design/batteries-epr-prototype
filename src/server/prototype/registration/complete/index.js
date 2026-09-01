import { paths } from '../../../../config/paths.js'
import { completeController } from './controller.js'

export const complete = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegistrationComplete,
      ...completeController
    }
  ]
}
