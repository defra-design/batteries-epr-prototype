import { signIn } from './signIn/index.js'
import { dashboard } from './dashboard/index.js'
import { schemeHome } from './schemeHome/index.js'
import { schemeRecord } from './schemeRecord/index.js'
import { schemeMembers } from './schemeMembers/index.js'
import { schemeSubmissions } from './schemeSubmissions/index.js'
import { runningDataChecks } from './runningDataChecks/index.js'
import { dataCheckReport } from './dataCheckReport/index.js'
import { batterySalesDataSubmission } from './batterySalesDataSubmission/index.js'
import { reviewPomReturn } from './reviewPomReturn/index.js'
import { reviewPomReturnAccepted } from './reviewPomReturnAccepted/index.js'
import { reviewPomReturnQueried } from './reviewPomReturnQueried/index.js'
import { reviewPomReturnRejected } from './reviewPomReturnRejected/index.js'
import { reviewPomReturnRejectConfirm } from './reviewPomReturnRejectConfirm/index.js'

export const prototypeRegulatorPomSubmission = {
  openRoutes: [
    ...signIn.openRoutes,
    ...dashboard.openRoutes,
    ...schemeHome.openRoutes,
    ...schemeRecord.openRoutes,
    ...schemeMembers.openRoutes,
    ...schemeSubmissions.openRoutes,
    ...runningDataChecks.openRoutes,
    ...dataCheckReport.openRoutes,
    ...batterySalesDataSubmission.openRoutes,
    ...reviewPomReturn.openRoutes,
    ...reviewPomReturnAccepted.openRoutes,
    ...reviewPomReturnQueried.openRoutes,
    ...reviewPomReturnRejectConfirm.openRoutes,
    ...reviewPomReturnRejected.openRoutes
  ]
}
