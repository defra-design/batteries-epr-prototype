import { paths } from '../../config/paths.js'
import { playgroundController } from './controller.js'

export const playground = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.playground,
      ...playgroundController
    }
  ]
}
