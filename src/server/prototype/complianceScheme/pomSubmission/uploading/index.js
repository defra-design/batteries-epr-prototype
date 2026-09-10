import { paths } from '../../../../../config/paths.js'
import { uploadingController } from './controller.js'

export const uploading = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeComplianceSchemeSubmissionUploading,
      ...uploadingController
    }
  ]
}
