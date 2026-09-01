import { paths } from '../../../../config/paths.js'
import { prototypeSubmissionContent } from '../../../../config/prototype-submission-content.js'
import { basePageModel, buildHydrationPayload } from '../shared.js'

export const paymentConfirmedController = {
  handler(_request, h) {
    const pageContent = prototypeSubmissionContent.paymentConfirmed

    return h.view('prototype/submission/paymentConfirmed/view', {
      ...basePageModel(pageContent),
      heading: pageContent.panelTitle,
      accountUrl: paths.prototypeSubmissionAccount,
      pagePayload: buildHydrationPayload('paymentConfirmed')
    })
  }
}
