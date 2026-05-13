import { paths } from '../../config/paths.js'
import { devTimeTravelController } from './controller.js'

export const devTimeTravel = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.devTimeTravel,
      ...devTimeTravelController
    }
  ]
}
