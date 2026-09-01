import { paths } from '../../../../config/paths.js'
import { prototypeSubmissionContent } from '../../../../config/prototype-submission-content.js'
import { basePageModel } from '../shared.js'

export const payFeeController = {
  handler(_request, h) {
    const pageContent = prototypeSubmissionContent.payFee

    return h.view('prototype/submission/payFee/view', {
      ...basePageModel(pageContent),
      breadcrumbs: prototypeSubmissionContent.breadcrumbs,
      paymentUrl: paths.prototypeSubmissionPayment
    })
  }
}
