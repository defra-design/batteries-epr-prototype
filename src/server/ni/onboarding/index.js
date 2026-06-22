import { companyDetails } from './companyDetails/index.js'
import { contactDetails } from './contactDetails/index.js'
import { batteryCategories } from './batteryCategories/index.js'
import { brandNames } from './brandNames/index.js'
import { producerRoute } from './producerRoute/index.js'
import { carbonFootprint } from './carbonFootprint/index.js'
import { batteryPassport } from './batteryPassport/index.js'
import { dueDiligence } from './dueDiligence/index.js'
import { declaration } from './declaration/index.js'
import { confirmation } from './confirmation/index.js'

export const niOnboarding = {
  openRoutes: [
    ...companyDetails.openRoutes,
    ...contactDetails.openRoutes,
    ...batteryCategories.openRoutes,
    ...brandNames.openRoutes,
    ...producerRoute.openRoutes,
    ...carbonFootprint.openRoutes,
    ...batteryPassport.openRoutes,
    ...dueDiligence.openRoutes,
    ...declaration.openRoutes,
    ...confirmation.openRoutes
  ]
}
