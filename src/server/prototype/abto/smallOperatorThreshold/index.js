import { email } from './email/index.js'
import { threshold } from './threshold/index.js'
import { pay } from './pay/index.js'
import { cardPayment } from './cardPayment/index.js'
import { paymentReceived } from './paymentReceived/index.js'
import { wasteReturns } from './wasteReturns/index.js'

export const prototypeAbtoSmallOperatorThreshold = {
  openRoutes: [
    ...email.openRoutes,
    ...threshold.openRoutes,
    ...pay.openRoutes,
    ...cardPayment.openRoutes,
    ...paymentReceived.openRoutes,
    ...wasteReturns.openRoutes
  ]
}
