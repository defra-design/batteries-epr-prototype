import { paths } from '../../../../config/paths.js'
import { listController } from './controller.js'

export const regulatorEvidenceList = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.regulatorEvidence,
      ...listController
    }
  ]
}
