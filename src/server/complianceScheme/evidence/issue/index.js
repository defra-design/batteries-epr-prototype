import { paths } from '../../../../config/paths.js'
import { issueController } from './controller.js'

export const evidenceIssue = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.complianceSchemeEvidenceIssue,
      ...issueController.get
    },
    {
      method: 'POST',
      path: paths.complianceSchemeEvidenceIssue,
      ...issueController.post
    }
  ]
}
