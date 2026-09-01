import { paths } from '../../../../config/paths.js'
import { prototypeSubmissionContent } from '../../../../config/prototype-submission-content.js'
import { basePageModel, buildHydrationPayload } from '../shared.js'

export const accountController = {
  handler(_request, h) {
    const pageContent = prototypeSubmissionContent.account

    return h.view('prototype/submission/account/view', {
      ...basePageModel(pageContent),
      urls: {
        account: paths.prototypeSubmissionAccount,
        tasks: paths.prototypeSubmissionTasks,
        taskStart: paths.prototypeSubmissionTaskStart
      },
      pagePayload: buildHydrationPayload('account')
    })
  }
}
