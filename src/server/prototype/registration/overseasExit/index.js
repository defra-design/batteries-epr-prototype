import { paths } from '../../../../config/paths.js'
import { overseasExitController } from './controller.js'

export const overseasExit = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegistrationOverseasExit,
      ...overseasExitController
    }
  ]
}
