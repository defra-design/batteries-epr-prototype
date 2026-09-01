import { paths } from '../../../../config/paths.js'
import { startController } from './controller.js'

export const start = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegistrationStart,
      ...startController
    }
  ]
}
