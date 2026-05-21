import { paths } from '../../../config/paths.js'
import { applicationController } from './controller.js'

export const complianceSchemeApplication = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.complianceSchemeApplication,
      ...applicationController.get
    },
    {
      method: 'POST',
      path: paths.complianceSchemeApplication,
      ...applicationController.post
    }
  ]
}
