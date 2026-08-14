import { paths } from '../../config/paths.js'
import { landingController } from './controller.js'

export const landing = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.home,
      ...landingController
    }
  ]
}
