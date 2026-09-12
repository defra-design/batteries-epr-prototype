import { paths } from '../../../../../config/paths.js'
import { uploadCsvController } from './controller.js'

export const uploadCsv = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeMembersListUploadCsv,
      ...uploadCsvController.get
    },
    {
      method: 'POST',
      path: paths.prototypeMembersListUploadCsv,
      ...uploadCsvController.post
    }
  ]
}
