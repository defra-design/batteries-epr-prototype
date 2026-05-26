import { paths } from '../../../../config/paths.js'
import { listController } from './controller.js'

export const regulatorSchemeList = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.regulatorSchemes,
      ...listController
    }
  ]
}
