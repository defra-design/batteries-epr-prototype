import { paths } from '../../../../config/paths.js'
import { listController } from './controller.js'

export const regulatorOperatorList = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.regulatorOperators,
      ...listController
    }
  ]
}
