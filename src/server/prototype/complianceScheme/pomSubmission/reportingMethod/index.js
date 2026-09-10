import { paths } from '../../../../../config/paths.js'
import { reportingMethodController } from './controller.js'

export const reportingMethod = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeComplianceSchemeSubmissionReportingMethod,
      ...reportingMethodController.get
    },
    {
      method: 'POST',
      path: paths.prototypeComplianceSchemeSubmissionReportingMethod,
      ...reportingMethodController.post
    }
  ]
}
