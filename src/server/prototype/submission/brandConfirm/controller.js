import { paths } from '../../../../config/paths.js'
import { prototypeSubmissionContent } from '../../../../config/prototype-submission-content.js'
import { basePageModel, buildHydrationPayload } from '../shared.js'

export const brandConfirmController = {
  handler(_request, h) {
    const pageContent = prototypeSubmissionContent.brandConfirm

    return h.view('prototype/submission/brandConfirm/view', {
      ...basePageModel(pageContent),
      backLink: paths.prototypeSubmissionBrandAdd,
      addUrl: paths.prototypeSubmissionBrandAdd,
      continueUrl: paths.prototypeSubmissionData,
      accountUrl: paths.prototypeSubmissionAccount,
      pagePayload: buildHydrationPayload('brandConfirm')
    })
  }
}
