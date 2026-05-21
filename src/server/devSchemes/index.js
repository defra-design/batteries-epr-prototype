import { paths } from '../../config/paths.js'
import { devSchemesController } from './controller.js'

export const devSchemes = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.devSchemes,
      ...devSchemesController
    }
  ]
}
