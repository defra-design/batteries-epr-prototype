import { content } from '../../../../config/content.js'
import { paths } from '../../../../config/paths.js'
import { getCompliancePeriod } from '../../../../config/compliance-period.js'

export const listController = {
  handler(request, h) {
    const pageContent = content.complianceScheme(request).evidencePages
    const listContent = pageContent.list
    const compliancePeriodYear = getCompliancePeriod(request)

    const pagePayload = {
      view: 'list',
      compliancePeriodYear,
      copy: listContent,
      urls: {
        issue: paths.complianceSchemeEvidenceIssue.replace(
          '{step}',
          'recipient'
        ),
        availability: paths.complianceSchemeEvidenceAvailability,
        detailTemplate: paths.complianceSchemeEvidenceDetail,
        dashboard: paths.complianceSchemeDashboard
      }
    }

    return h.view('complianceScheme/evidence/list/view', {
      pageTitle: listContent.title,
      heading: listContent.heading,
      intro: listContent.intro,
      labels: listContent,
      compliancePeriodYear,
      pagePayload
    })
  }
}
