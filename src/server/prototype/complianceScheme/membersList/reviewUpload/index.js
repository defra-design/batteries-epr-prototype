import { paths } from '../../../../../config/paths.js'
import { reviewUploadController } from './controller.js'
import { fix } from './fix/index.js'

export const reviewUpload = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeMembersListReviewUpload,
      ...reviewUploadController.get
    },
    {
      method: 'POST',
      path: paths.prototypeMembersListReviewUpload,
      ...reviewUploadController.post
    },
    ...fix.openRoutes
  ]
}
