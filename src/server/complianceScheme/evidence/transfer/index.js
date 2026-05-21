import { paths } from '../../../../config/paths.js'
import { transferController } from './controller.js'

export const evidenceTransfer = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.complianceSchemeEvidenceTransfer,
      ...transferController.get
    },
    {
      method: 'POST',
      path: paths.complianceSchemeEvidenceTransfer,
      ...transferController.post
    }
  ]
}
