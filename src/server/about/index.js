import { paths } from '../../config/paths.js'
import { aboutController } from './controller.js'

export const about = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.about,
      ...aboutController
    }
  ]
}
