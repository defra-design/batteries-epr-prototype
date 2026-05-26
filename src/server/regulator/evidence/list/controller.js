import { content } from '../../../../config/content.js'
import { paths } from '../../../../config/paths.js'
import { getCompliancePeriod } from '../../../../config/compliance-period.js'

export const listController = {
  handler(request, h) {
    const pageContent = content.regulator(request)
    const listContent = pageContent.evidenceOverviewPages.list
    const compliancePeriodYear = getCompliancePeriod(request)

    const pagePayload = {
      view: 'list',
      compliancePeriodYear,
      copy: listContent,
      urls: {
        detailTemplate: paths.regulatorEvidenceDetail,
        dashboard: paths.regulatorDashboard
      }
    }

    return h.view('regulator/evidence/list/view', {
      pageTitle: listContent.title,
      heading: listContent.heading,
      intro: listContent.intro,
      labels: listContent,
      compliancePeriodYear,
      pagePayload
    })
  }
}
