import { paths } from '../../../../config/paths.js'
import { availabilityController } from './controller.js'

export const evidenceAvailability = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.complianceSchemeEvidenceAvailability,
      ...availabilityController.get
    },
    {
      method: 'POST',
      path: paths.complianceSchemeEvidenceAvailability,
      ...availabilityController.post
    }
  ]
}
