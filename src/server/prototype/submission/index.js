import { signIn } from './signIn/index.js'
import { terms } from './terms/index.js'
import { account } from './account/index.js'
import { tasks } from './tasks/index.js'
import { taskStart } from './taskStart/index.js'
import { batteryCategory } from './batteryCategory/index.js'
import { tonnage } from './tonnage/index.js'
import { checkRegistration } from './checkRegistration/index.js'
import { brandQuestion } from './brandQuestion/index.js'
import { brandAdd } from './brandAdd/index.js'
import { brandConfirm } from './brandConfirm/index.js'
import { data } from './data/index.js'
import { checkData } from './checkData/index.js'
import { payFee } from './payFee/index.js'
import { payment } from './payment/index.js'
import { paymentConfirmed } from './paymentConfirmed/index.js'

export const prototypeSubmission = {
  openRoutes: [
    ...signIn.openRoutes,
    ...terms.openRoutes,
    ...account.openRoutes,
    ...tasks.openRoutes,
    ...taskStart.openRoutes,
    ...batteryCategory.openRoutes,
    ...tonnage.openRoutes,
    ...checkRegistration.openRoutes,
    ...brandQuestion.openRoutes,
    ...brandAdd.openRoutes,
    ...brandConfirm.openRoutes,
    ...data.openRoutes,
    ...checkData.openRoutes,
    ...payFee.openRoutes,
    ...payment.openRoutes,
    ...paymentConfirmed.openRoutes
  ]
}
