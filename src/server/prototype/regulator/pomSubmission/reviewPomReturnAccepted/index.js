import { paths } from '../../../../../config/paths.js'
import { reviewPomReturnAcceptedController } from './controller.js'

export const reviewPomReturnAccepted = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorPomSubmissionReviewPomReturnAccepted,
      ...reviewPomReturnAcceptedController
    }
  ]
}
