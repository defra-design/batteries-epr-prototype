import { paths } from '../../../../config/paths.js'
import { issueController } from './controller.js'

export const operatorEvidenceIssue = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.operatorEvidenceIssue,
      ...issueController.get
    },
    {
      method: 'POST',
      path: paths.operatorEvidenceIssue,
      ...issueController.post
    }
  ]
}
