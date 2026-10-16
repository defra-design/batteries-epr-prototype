import { signIn } from './signIn/index.js'
import { home } from './home/index.js'
import { dashboard } from './dashboard/index.js'
import { preRegistrationLink } from './preRegistrationLink/index.js'
import { preRegistrationLinkSent } from './preRegistrationLinkSent/index.js'
import { applicationOverview } from './applicationOverview/index.js'
import { schemeDashboard } from './schemeDashboard/index.js'
import { memberListReview } from './memberListReview/index.js'
import { memberListAccepted } from './memberListAccepted/index.js'
import { memberListRejected } from './memberListRejected/index.js'
import { applicationStep } from './applicationStep/index.js'
import { applicationReview } from './applicationReview/index.js'
import { applicationAccepted } from './applicationAccepted/index.js'
import { applicationConditions } from './applicationConditions/index.js'
import { applicationRejected } from './applicationRejected/index.js'
import { applicationSchemeRecord } from './applicationSchemeRecord/index.js'

export const prototypeRegulatorRegistrations = {
  openRoutes: [
    ...signIn.openRoutes,
    ...home.openRoutes,
    ...dashboard.openRoutes,
    ...preRegistrationLink.openRoutes,
    ...preRegistrationLinkSent.openRoutes,
    ...applicationOverview.openRoutes,
    ...schemeDashboard.openRoutes,
    ...memberListReview.openRoutes,
    ...memberListAccepted.openRoutes,
    ...memberListRejected.openRoutes,
    ...applicationStep.openRoutes,
    ...applicationReview.openRoutes,
    ...applicationAccepted.openRoutes,
    ...applicationConditions.openRoutes,
    ...applicationRejected.openRoutes,
    ...applicationSchemeRecord.openRoutes
  ]
}
