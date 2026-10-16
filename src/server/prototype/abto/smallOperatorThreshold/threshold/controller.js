import { paths } from '../../../../../config/paths.js'
import { prototypeAbtoContent } from '../../../../../config/prototype-abto-content.js'
import { accountPageModel, fill, formatMoney, longDate } from '../shared.js'
import {
  formatTonnes,
  getDaysToPay,
  getExceededCategory,
  getThreshold,
  getTotalsRows
} from '../store.js'

export const thresholdController = {
  handler(_request, h) {
    const pageContent = prototypeAbtoContent.threshold
    const threshold = getThreshold()

    return h.view('prototype/abto/smallOperatorThreshold/threshold/view', {
      ...accountPageModel(pageContent, paths.prototypeAbtoThreshold),
      backLink: paths.prototypeAbtoThresholdEmail,
      bannerText: fill(pageContent.banner.body, {
        days: getDaysToPay(),
        payBy: longDate(threshold.payBy)
      }),
      explanation: fill(pageContent.explanation, {
        threshold: formatTonnes(getExceededCategory().thresholdTonnes)
      }),
      balanceDue: fill(pageContent.balanceDue, {
        amount: formatMoney(threshold.balanceDuePence)
      }),
      totalsColumns: prototypeAbtoContent.totals.columns,
      totalsRows: getTotalsRows(),
      payHref: paths.prototypeAbtoThresholdPay
    })
  }
}
