import { paths } from '../../../../../config/paths.js'
import { applicationAcceptedController } from './controller.js'

export const applicationAccepted = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorApplicationAccepted,
      ...applicationAcceptedController
    }
  ]
}
