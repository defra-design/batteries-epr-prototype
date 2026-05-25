import { paths } from '../../../../config/paths.js'
import { listController } from './controller.js'

export const operatorEvidenceList = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.operatorEvidence,
      ...listController
    }
  ]
}
