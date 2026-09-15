import { organisationType } from './organisationType/index.js'
import { companiesHouse } from './companiesHouse/index.js'
import { partnershipDetails } from './partnershipDetails/index.js'
import { soleTraderDetails } from './soleTraderDetails/index.js'
import { ukBusinessPresence } from './ukBusinessPresence/index.js'
import { overseasDetails } from './overseasDetails/index.js'
import { overseasExit } from './overseasExit/index.js'
import { legalNoticesAddress } from './legalNoticesAddress/index.js'
import { appropriatePerson } from './appropriatePerson/index.js'
import { batteryCategory } from './batteryCategory/index.js'
import { tonnage } from './tonnage/index.js'
import { dateJoined } from './dateJoined/index.js'
import { checkAnswers } from './checkAnswers/index.js'

export const addMember = {
  openRoutes: [
    ...organisationType.openRoutes,
    ...companiesHouse.openRoutes,
    ...partnershipDetails.openRoutes,
    ...soleTraderDetails.openRoutes,
    ...ukBusinessPresence.openRoutes,
    ...overseasDetails.openRoutes,
    ...overseasExit.openRoutes,
    ...legalNoticesAddress.openRoutes,
    ...appropriatePerson.openRoutes,
    ...batteryCategory.openRoutes,
    ...tonnage.openRoutes,
    ...dateJoined.openRoutes,
    ...checkAnswers.openRoutes
  ]
}
