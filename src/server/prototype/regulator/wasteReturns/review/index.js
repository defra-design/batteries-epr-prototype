import { paths } from '../../../../../config/paths.js'
import { reviewController } from './controller.js'

export const review = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorWasteReturnsReview,
      ...reviewController
    }
  ]
}
