import { paths } from '../../../../../config/paths.js'
import { submissionsController } from './controller.js'

export const submissions = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeComplianceSchemeSubmissionSubmissions,
      ...submissionsController
    }
  ]
}
