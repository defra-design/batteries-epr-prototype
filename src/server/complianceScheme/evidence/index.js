import { evidenceList } from './list/index.js'
import { evidenceDetail } from './detail/index.js'
import { evidenceIssue } from './issue/index.js'
import { evidenceTransfer } from './transfer/index.js'
import { evidenceAvailability } from './availability/index.js'

export const complianceSchemeEvidence = {
  openRoutes: [
    ...evidenceAvailability.openRoutes,
    ...evidenceIssue.openRoutes,
    ...evidenceTransfer.openRoutes,
    ...evidenceDetail.openRoutes,
    ...evidenceList.openRoutes
  ]
}
