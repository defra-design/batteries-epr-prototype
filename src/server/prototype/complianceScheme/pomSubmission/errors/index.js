import { paths } from '../../../../../config/paths.js'
import { errorsController } from './controller.js'

export const errors = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeComplianceSchemeSubmissionErrors,
      ...errorsController.get
    },
    {
      method: 'POST',
      path: paths.prototypeComplianceSchemeSubmissionErrors,
      ...errorsController.post
    }
  ]
}
