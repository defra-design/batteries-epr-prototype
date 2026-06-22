import { companyDetails } from './companyDetails/index.js'
import { contactDetails } from './contactDetails/index.js'
import { batteryCategories } from './batteryCategories/index.js'
import { brandNames } from './brandNames/index.js'
import { producerRoute } from './producerRoute/index.js'
import { declaration } from './declaration/index.js'
import { confirmation } from './confirmation/index.js'

export const niOnboarding = {
  openRoutes: [
    ...companyDetails.openRoutes,
    ...contactDetails.openRoutes,
    ...batteryCategories.openRoutes,
    ...brandNames.openRoutes,
    ...producerRoute.openRoutes,
    ...declaration.openRoutes,
    ...confirmation.openRoutes
  ]
}
