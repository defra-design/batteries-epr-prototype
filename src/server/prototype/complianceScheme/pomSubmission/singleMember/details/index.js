import { paths } from '../../../../../../config/paths.js'
import { singleMemberDetailsController } from './controller.js'

export const singleMemberDetails = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeComplianceSchemeSubmissionSingleMemberDetails,
      ...singleMemberDetailsController.get
    },
    {
      method: 'POST',
      path: paths.prototypeComplianceSchemeSubmissionSingleMemberDetails,
      ...singleMemberDetailsController.post
    }
  ]
}
