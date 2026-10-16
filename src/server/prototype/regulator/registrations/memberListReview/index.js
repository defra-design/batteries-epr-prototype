import { paths } from '../../../../../config/paths.js'
import { memberListReviewController } from './controller.js'

export const memberListReview = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorSchemeMemberList,
      ...memberListReviewController.get
    },
    {
      method: 'POST',
      path: paths.prototypeRegulatorSchemeMemberList,
      ...memberListReviewController.post
    }
  ]
}
