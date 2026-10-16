import { paths } from '../../../../../config/paths.js'
import { prototypeAbtoContent } from '../../../../../config/prototype-abto-content.js'
import { formatMoney, taskFlowPageModel } from '../shared.js'
import { getThreshold, recordPayment } from '../store.js'

export const cardPaymentController = {
  get: {
    handler(_request, h) {
      const pageContent = prototypeAbtoContent.cardPayment
      const threshold = getThreshold()

      return h.view('prototype/abto/smallOperatorThreshold/cardPayment/view', {
        ...taskFlowPageModel(pageContent),
        backLink: paths.prototypeAbtoThresholdPay,
        amount: formatMoney(threshold.balanceDuePence),
        reason: prototypeAbtoContent.pay.reason,
        reference: threshold.payment.reference
      })
    }
  },
  post: {
    handler(request, h) {
      if (request.payload?.outcome === 'success') {
        recordPayment(prototypeAbtoContent.pay.methods.card)
        return h.redirect(paths.prototypeAbtoThresholdPaymentReceived)
      }

      return h.redirect(paths.prototypeAbtoThresholdPay)
    }
  }
}
