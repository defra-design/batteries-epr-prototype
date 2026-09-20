import { paths } from '../../../../../config/paths.js'
import { reviewPomReturnController } from './controller.js'

export const reviewPomReturn = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorPomSubmissionReviewPomReturn,
      ...reviewPomReturnController.get
    },
    {
      method: 'POST',
      path: paths.prototypeRegulatorPomSubmissionReviewPomReturn,
      ...reviewPomReturnController.post
    }
  ]
}
