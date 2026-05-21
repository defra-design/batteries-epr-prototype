import { paths } from '../../../config/paths.js'
import { accountSchemeController } from './controller.js'

export const accountScheme = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.accountScheme,
      ...accountSchemeController
    }
  ]
}
