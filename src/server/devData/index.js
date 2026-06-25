import { paths } from '../../config/paths.js'
import { devDataController } from './controller.js'

export const devData = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.devData,
      ...devDataController
    }
  ]
}
