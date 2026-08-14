import { paths } from '../../config/paths.js'
import { prototypeController } from './controller.js'

export const prototype = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototype,
      ...prototypeController
    }
  ]
}
