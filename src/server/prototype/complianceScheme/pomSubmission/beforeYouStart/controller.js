import { paths } from '../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'
import { taskFlowPageModel } from '../shared.js'

export const beforeYouStartController = {
  handler(request, h) {
    const { year, quarter } = request.params
    const pageContent = prototypeComplianceSchemeContent.beforeYouStart

    const heading = `Before you submit your Q${quarter} ${year} return`
    const caption = `${year} ${pageContent.complianceCaption}`

    return h.view(
      'prototype/complianceScheme/pomSubmission/beforeYouStart/view',
      {
        ...taskFlowPageModel({ ...pageContent, title: heading, heading }),
        caption,
        backLink: paths.prototypeComplianceSchemeSubmissionSubmissions,
        checkSchemeUrl: paths.prototypeComplianceSchemeSubmissionDashboard,
        beginUrl: paths.prototypeComplianceSchemeSubmissionReportingMethod
          .replace('{year}', year)
          .replace('{quarter}', quarter)
      }
    )
  }
}
