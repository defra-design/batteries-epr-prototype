import { paths } from '../../../../config/paths.js'
import { detailController } from './controller.js'

export const operatorEvidenceDetail = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.operatorEvidenceDetail,
      ...detailController.get
    }
  ]
}
