import { paths } from '../../../../config/paths.js'
import { detailController } from './controller.js'

export const evidenceDetail = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.complianceSchemeEvidenceDetail,
      ...detailController.get
    },
    {
      method: 'POST',
      path: paths.complianceSchemeEvidenceDetail,
      ...detailController.post
    }
  ]
}
