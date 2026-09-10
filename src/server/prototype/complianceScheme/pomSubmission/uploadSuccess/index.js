import { paths } from '../../../../../config/paths.js'
import { uploadSuccessController } from './controller.js'

export const uploadSuccess = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeComplianceSchemeSubmissionUploadSuccess,
      ...uploadSuccessController
    }
  ]
}
