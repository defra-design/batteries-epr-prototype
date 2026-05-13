import { paths } from '../../config/paths.js'
import { accessibilityController } from './controller.js'

export const accessibility = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.accessibility,
      ...accessibilityController
    }
  ]
}
