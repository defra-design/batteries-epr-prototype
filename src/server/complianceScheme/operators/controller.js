import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import { getCompliancePeriod } from '../../../config/compliance-period.js'

export const operatorsController = {
  handler(request, h) {
    const listContent = content.complianceScheme(request).operatorsPage
    const compliancePeriodYear = getCompliancePeriod(request)

    const pagePayload = {
      view: 'list',
      compliancePeriodYear,
      copy: listContent,
      urls: { dashboard: paths.complianceSchemeDashboard }
    }

    return h.view('complianceScheme/operators/view', {
      pageTitle: listContent.title,
      heading: listContent.heading,
      intro: listContent.intro,
      labels: listContent,
      compliancePeriodYear,
      pagePayload
    })
  }
}
