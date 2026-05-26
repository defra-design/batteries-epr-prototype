import { paths } from '../../../../config/paths.js'
import { detailController } from './controller.js'

export const regulatorEvidenceDetail = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.regulatorEvidenceDetail,
      ...detailController
    }
  ]
}
