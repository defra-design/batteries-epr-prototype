import { operatorEvidenceList } from './list/index.js'
import { operatorEvidenceIssue } from './issue/index.js'
import { operatorEvidenceDetail } from './detail/index.js'

export const operatorEvidence = {
  openRoutes: [
    ...operatorEvidenceList.openRoutes,
    ...operatorEvidenceIssue.openRoutes,
    ...operatorEvidenceDetail.openRoutes
  ]
}
