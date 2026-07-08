import { paths } from '../../config/paths.js'
import { npwdPackagingComparisonController } from './controller.js'

export const npwdPackagingComparison = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.npwdPackagingComparison,
      ...npwdPackagingComparisonController
    }
  ]
}
