import { paths } from '../../../../../config/paths.js'
import { prototypeAbtoContent } from '../../../../../config/prototype-abto-content.js'
import { formatMoney, longDate, taskFlowPageModel } from '../shared.js'
import { getThreshold, recordPayment } from '../store.js'

const METHODS = { card: 'card', bankTransfer: 'bank-transfer' }

const buildView = (h, { error } = {}) => {
  const pageContent = prototypeAbtoContent.pay
  const threshold = getThreshold()

  return h.view('prototype/abto/smallOperatorThreshold/pay/view', {
    ...taskFlowPageModel(pageContent),
    backLink: paths.prototypeAbtoThreshold,
    amountDue: formatMoney(threshold.balanceDuePence),
    payBy: longDate(threshold.payBy),
    methods: [
      { value: METHODS.card, text: pageContent.methods.card },
      { value: METHODS.bankTransfer, text: pageContent.methods.bankTransfer }
    ],
    error
  })
}

export const payController = {
  get: {
    handler: (_request, h) => buildView(h)
  },
  post: {
    handler(request, h) {
      const method = request.payload?.paymentMethod
      const { methods, errorMessage } = prototypeAbtoContent.pay

      if (method === METHODS.card) {
        return h.redirect(paths.prototypeAbtoThresholdCardPayment)
      }

      if (method === METHODS.bankTransfer) {
        // Gap: no bank transfer screens are designed yet, so this records the
        // payment and goes straight to the confirmation.
        recordPayment(methods.bankTransfer)
        return h.redirect(paths.prototypeAbtoThresholdPaymentReceived)
      }

      return buildView(h, { error: errorMessage })
    }
  }
}
