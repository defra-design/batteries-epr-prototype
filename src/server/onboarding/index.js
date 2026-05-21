import { companyDetails } from './companyDetails/index.js'
import { contactDetails } from './contactDetails/index.js'
import { serviceOfNotice } from './serviceOfNotice/index.js'
import { batteryTypes } from './batteryTypes/index.js'
import { brandNames } from './brandNames/index.js'
import { producerRoute } from './producerRoute/index.js'
import { schemeSelect } from './schemeSelect/index.js'
import { schemeConfirm } from './schemeConfirm/index.js'
import { declaration } from './declaration/index.js'
import { confirmation } from './confirmation/index.js'

export const onboarding = {
  openRoutes: [
    ...companyDetails.openRoutes,
    ...contactDetails.openRoutes,
    ...serviceOfNotice.openRoutes,
    ...batteryTypes.openRoutes,
    ...brandNames.openRoutes,
    ...producerRoute.openRoutes,
    ...schemeSelect.openRoutes,
    ...schemeConfirm.openRoutes,
    ...declaration.openRoutes,
    ...confirmation.openRoutes
  ]
}
