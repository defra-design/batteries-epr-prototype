import { paths } from '../../../../../config/paths.js'
import { reviewPomReturnQueriedController } from './controller.js'

export const reviewPomReturnQueried = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorPomSubmissionReviewPomReturnQueried,
      ...reviewPomReturnQueriedController
    }
  ]
}
