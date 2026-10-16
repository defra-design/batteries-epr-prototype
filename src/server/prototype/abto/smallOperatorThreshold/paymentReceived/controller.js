import { paths } from '../../../../../config/paths.js'
import { prototypeAbtoContent } from '../../../../../config/prototype-abto-content.js'
import { formatDate } from '../../../../../config/nunjucks/filters/format-date.js'
import { accountPageModel, formatMoney } from '../shared.js'
import { getPayment, getThreshold } from '../store.js'

export const paymentReceivedController = {
  handler(_request, h) {
    const payment = getPayment()
    if (!payment) {
      return h.redirect(paths.prototypeAbtoThreshold)
    }

    const pageContent = prototypeAbtoContent.paymentReceived

    return h.view(
      'prototype/abto/smallOperatorThreshold/paymentReceived/view',
      {
        ...accountPageModel(
          pageContent,
          paths.prototypeAbtoThresholdPaymentReceived
        ),
        amountPaid: formatMoney(getThreshold().balanceDuePence),
        method: payment.method,
        reference: payment.reference,
        paidOn: formatDate(payment.paidOn, 'd MMMM yyyy, h:mmaaa'),
        returnsHref: paths.prototypeAbtoWasteReturns
      }
    )
  }
}
