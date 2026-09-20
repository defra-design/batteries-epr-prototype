import { paths } from '../../../../../config/paths.js'
import { reviewPomReturnRejectedController } from './controller.js'

export const reviewPomReturnRejected = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorPomSubmissionReviewPomReturnRejected,
      ...reviewPomReturnRejectedController
    }
  ]
}
