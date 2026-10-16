import { paths } from '../../../../../config/paths.js'
import { applicationReviewController } from './controller.js'

export const applicationReview = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorApplicationReview,
      ...applicationReviewController.get
    },
    {
      method: 'POST',
      path: paths.prototypeRegulatorApplicationReview,
      ...applicationReviewController.post
    }
  ]
}
