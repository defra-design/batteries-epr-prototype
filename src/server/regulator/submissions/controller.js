import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import { getCompliancePeriod } from '../../../config/compliance-period.js'

export const submissionsController = {
  handler(request, h) {
    const pageContent = content.regulator(request)
    const submissionsContent = pageContent.submissionsPages
    const compliancePeriodYear = getCompliancePeriod(request)

    const pagePayload = {
      view: 'list',
      compliancePeriodYear,
      copy: submissionsContent,
      urls: {
        dashboard: paths.regulatorDashboard
      }
    }

    return h.view('regulator/submissions/view', {
      pageTitle: submissionsContent.title,
      heading: submissionsContent.heading,
      intro: submissionsContent.intro,
      labels: submissionsContent,
      compliancePeriodYear,
      pagePayload
    })
  }
}
