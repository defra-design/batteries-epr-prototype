import { start } from './start/index.js'
import { oneLogin } from './oneLogin/index.js'
import { signIn } from './signIn/index.js'
import { batteryCategory } from './batteryCategory/index.js'
import { differentService } from './differentService/index.js'
import { tonnage } from './tonnage/index.js'
import { organisationType } from './organisationType/index.js'
import { companiesHouse } from './companiesHouse/index.js'
import { partnershipDetails } from './partnershipDetails/index.js'
import { soleTraderDetails } from './soleTraderDetails/index.js'
import { overseasDetails } from './overseasDetails/index.js'
import { overseasExit } from './overseasExit/index.js'
import { appropriatePersonGuidance } from './appropriatePersonGuidance/index.js'
import { appropriatePerson } from './appropriatePerson/index.js'
import { schemeMembership } from './schemeMembership/index.js'
import { schemeSelect } from './schemeSelect/index.js'
import { checkAnswers } from './checkAnswers/index.js'
import { declaration } from './declaration/index.js'
import { complete } from './complete/index.js'

export const prototypeRegistration = {
  openRoutes: [
    ...start.openRoutes,
    ...oneLogin.openRoutes,
    ...signIn.openRoutes,
    ...batteryCategory.openRoutes,
    ...differentService.openRoutes,
    ...tonnage.openRoutes,
    ...organisationType.openRoutes,
    ...companiesHouse.openRoutes,
    ...partnershipDetails.openRoutes,
    ...soleTraderDetails.openRoutes,
    ...overseasDetails.openRoutes,
    ...overseasExit.openRoutes,
    ...appropriatePersonGuidance.openRoutes,
    ...appropriatePerson.openRoutes,
    ...schemeMembership.openRoutes,
    ...schemeSelect.openRoutes,
    ...checkAnswers.openRoutes,
    ...declaration.openRoutes,
    ...complete.openRoutes
  ]
}
