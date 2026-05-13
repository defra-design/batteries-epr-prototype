import { content } from '../../../../config/content.js'
import { paths, pathTo } from '../../../../config/paths.js'
import { COMPLIANCE_PERIOD } from '../../shared.js'

export const categoriesController = {
  handler(request, h) {
    const pageContent = content.annualReturnIaCategories(request)
    const { registrationId } = request.params

    return h.view('annualReturn/ia/categories/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      intro: pageContent.intro,
      labels: pageContent,
      tonnagesUrl: pathTo(paths.annualReturnIaTonnages, { registrationId }),
      dashboardUrl: paths.dashboard,
      pagePayload: {
        step: 'iaCategories',
        target: 'hydrate',
        compliancePeriod: COMPLIANCE_PERIOD,
        registrationId,
        signInUrl: paths.signIn,
        dashboardUrl: paths.dashboard
      }
    })
  }
}
