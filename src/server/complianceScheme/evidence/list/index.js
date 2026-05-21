import { paths } from '../../../../config/paths.js'
import { listController } from './controller.js'

export const evidenceList = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.complianceSchemeEvidence,
      ...listController
    }
  ]
}
