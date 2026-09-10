import { paths } from '../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'
import { basePageModel } from '../shared.js'

export const dashboardController = {
  handler(_request, h) {
    const pageContent = prototypeComplianceSchemeContent.dashboard

    const summaryListRows = pageContent.summaryRows.map((row) => ({
      key: { text: row.key },
      value: { text: row.value }
    }))

    return h.view('prototype/complianceScheme/pomSubmission/dashboard/view', {
      ...basePageModel(
        pageContent,
        paths.prototypeComplianceSchemeSubmissionDashboard
      ),
      summaryListRows
    })
  }
}
