import { paths } from '../../../config/paths.js'
import { operatorsController } from './controller.js'

export const complianceSchemeOperators = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.complianceSchemeOperators,
      ...operatorsController
    }
  ]
}
