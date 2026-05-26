import { paths } from '../../../../config/paths.js'
import { detailController } from './controller.js'

export const regulatorProducerDetail = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.regulatorProducerDetail,
      ...detailController
    }
  ]
}
