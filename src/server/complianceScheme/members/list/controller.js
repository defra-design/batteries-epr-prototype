import { content } from '../../../../config/content.js'
import { paths } from '../../../../config/paths.js'
import { getCompliancePeriod } from '../../../../config/compliance-period.js'

export const listController = {
  handler(request, h) {
    const pageContent = content.complianceScheme(request)
    const listContent = pageContent.membersPages.list
    const compliancePeriodYear = getCompliancePeriod(request)

    const pagePayload = {
      view: 'list',
      compliancePeriodYear,
      copy: listContent,
      urls: {
        add: paths.complianceSchemeMembersAdd,
        removeTemplate: paths.complianceSchemeMemberRemove,
        dashboard: paths.complianceSchemeDashboard
      }
    }

    return h.view('complianceScheme/members/list/view', {
      pageTitle: listContent.title,
      heading: listContent.heading,
      intro: listContent.intro,
      labels: listContent,
      compliancePeriodYear,
      pagePayload
    })
  }
}
