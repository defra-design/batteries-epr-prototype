import { paths } from '../../../../../config/paths.js'
import { thresholdController } from './controller.js'

export const threshold = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeAbtoThreshold,
      ...thresholdController
    }
  ]
}
