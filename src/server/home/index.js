import { paths } from '../../config/paths.js'
import { homeController } from './controller.js'

export const home = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.home,
      ...homeController
    }
  ]
}
