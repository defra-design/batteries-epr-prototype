import { paths } from '../../../../config/paths.js'
import { differentServiceController } from './controller.js'

export const differentService = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegistrationDifferentService,
      ...differentServiceController
    }
  ]
}
