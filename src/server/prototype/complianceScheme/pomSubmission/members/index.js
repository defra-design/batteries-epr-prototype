import { paths } from '../../../../../config/paths.js'
import { membersController } from './controller.js'

export const members = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeComplianceSchemeSubmissionMembers,
      ...membersController
    }
  ]
}
