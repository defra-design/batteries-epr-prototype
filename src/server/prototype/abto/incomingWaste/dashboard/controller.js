import { paths } from '../../../../../config/paths.js'
import {
  PROTOTYPE_ABTO_OPERATOR_NAME,
  prototypeAbtoContent
} from '../../../../../config/prototype-abto-content.js'
import { abtoPageModel } from '../shared.js'
import { formatTonnes, getDeliveries } from '../deliveries.js'

export const dashboardController = {
  handler(_request, h) {
    const pageContent = prototypeAbtoContent.dashboard

    const deliveries = getDeliveries().map((delivery) => ({
      ...delivery,
      reportedTonnesFormatted: formatTonnes(delivery.reportedTonnes),
      compareUrl: paths.prototypeAbtoIncomingWasteCompare.replace(
        '{deliveryId}',
        delivery.id
      )
    }))

    return h.view('prototype/abto/incomingWaste/dashboard/view', {
      ...abtoPageModel(pageContent),
      deliveries,
      verifyAction: pageContent.verifyAction,
      // Deliveries reported by a scheme in this browser are merged into the
      // table by the client from the storage adapter.
      pagePayload: {
        step: 'dashboard',
        target: 'hydrate',
        operatorName: PROTOTYPE_ABTO_OPERATOR_NAME,
        verifyAction: pageContent.verifyAction,
        compareUrlTemplate: paths.prototypeAbtoIncomingWasteCompare
      }
    })
  }
}
