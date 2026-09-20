import { paths } from '../../../../../config/paths.js'
import { reviewPomReturnRejectConfirmController } from './controller.js'

export const reviewPomReturnRejectConfirm = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorPomSubmissionReviewPomReturnRejectConfirm,
      ...reviewPomReturnRejectConfirmController.get
    },
    {
      method: 'POST',
      path: paths.prototypeRegulatorPomSubmissionReviewPomReturnRejectConfirm,
      ...reviewPomReturnRejectConfirmController.post
    }
  ]
}
