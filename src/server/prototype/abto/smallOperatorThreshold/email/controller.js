import { paths } from '../../../../../config/paths.js'
import { prototypeAbtoContent } from '../../../../../config/prototype-abto-content.js'
import { fill, longDate, taskFlowPageModel } from '../shared.js'
import {
  formatTonnes,
  getDaysToPay,
  getExceededCategory,
  getThreshold
} from '../store.js'

export const emailController = {
  handler(_request, h) {
    const pageContent = prototypeAbtoContent.email
    const threshold = getThreshold()
    const category = getExceededCategory()

    return h.view('prototype/abto/smallOperatorThreshold/email/view', {
      ...taskFlowPageModel(pageContent),
      sentOn: longDate(threshold.crossedOn),
      greeting: fill(pageContent.greeting, {
        name: threshold.appropriatePerson
      }),
      recipient: threshold.appropriatePerson,
      body: fill(pageContent.body, {
        operator: threshold.operatorName,
        threshold: category.thresholdTonnes,
        total: formatTonnes(category.totalTonnes)
      }),
      deadline: fill(pageContent.deadline, {
        days: getDaysToPay(),
        payBy: longDate(threshold.payBy)
      }),
      actionHref: paths.prototypeAbtoThreshold
    })
  }
}
