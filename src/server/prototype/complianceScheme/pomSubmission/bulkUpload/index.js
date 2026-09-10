import { paths } from '../../../../../config/paths.js'
import { bulkUploadController } from './controller.js'

export const bulkUpload = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeComplianceSchemeSubmissionBulkUpload,
      ...bulkUploadController.get
    },
    {
      method: 'POST',
      path: paths.prototypeComplianceSchemeSubmissionBulkUpload,
      ...bulkUploadController.post
    }
  ]
}
