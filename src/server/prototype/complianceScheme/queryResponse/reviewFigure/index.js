import { paths } from '../../../../../config/paths.js'
import { reviewFigureController } from './controller.js'

export const reviewFigure = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeComplianceSchemeQueryResponseReviewFigure,
      ...reviewFigureController
    }
  ]
}
