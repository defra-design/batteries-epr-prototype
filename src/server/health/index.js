import { paths } from '../../config/paths.js'
import { healthController } from './controller.js'

export const health = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.health,
      handler: healthController
    }
  ]
}
