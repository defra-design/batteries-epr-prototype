import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import { getCompliancePeriod } from '../../../config/compliance-period.js'

export const obligationController = {
  handler(request, h) {
    const pageContent = content.complianceScheme(request).obligationPage
    const compliancePeriodYear = getCompliancePeriod(request)

    const pagePayload = {
      view: 'obligation',
      compliancePeriodYear,
      copy: pageContent
    }

    return h.view('complianceScheme/obligation/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      intro: pageContent.intro,
      labels: pageContent,
      compliancePeriodYear,
      dashboardUrl: paths.complianceSchemeDashboard,
      pagePayload
    })
  }
}
