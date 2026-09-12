import { paths } from '../../../../../../config/paths.js'
import { fixController } from './controller.js'

export const fix = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeMembersListReviewUploadFix,
      ...fixController.get
    },
    {
      method: 'POST',
      path: paths.prototypeMembersListReviewUploadFix,
      ...fixController.post
    }
  ]
}
