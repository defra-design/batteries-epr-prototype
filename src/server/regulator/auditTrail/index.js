import { paths } from '../../../config/paths.js'
import { auditTrailController } from './controller.js'

export const regulatorAuditTrail = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.regulatorAuditTrail,
      ...auditTrailController
    }
  ]
}
