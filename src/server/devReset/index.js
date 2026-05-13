import { paths } from '../../config/paths.js'
import { devResetController } from './controller.js'

export const devReset = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.devReset,
      ...devResetController
    }
  ]
}
