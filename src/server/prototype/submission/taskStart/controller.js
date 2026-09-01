import { paths } from '../../../../config/paths.js'
import { prototypeSubmissionContent } from '../../../../config/prototype-submission-content.js'
import { basePageModel } from '../shared.js'

export const taskStartController = {
  handler(_request, h) {
    const pageContent = prototypeSubmissionContent.taskStart

    return h.view('prototype/submission/taskStart/view', {
      ...basePageModel(pageContent),
      continueUrl: paths.prototypeSubmissionBatteryCategory,
      backLink: paths.prototypeSubmissionAccount
    })
  }
}
