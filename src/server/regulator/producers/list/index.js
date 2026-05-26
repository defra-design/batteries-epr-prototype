import { paths } from '../../../../config/paths.js'
import { listController } from './controller.js'

export const regulatorProducerList = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.regulatorProducers,
      ...listController
    }
  ]
}
