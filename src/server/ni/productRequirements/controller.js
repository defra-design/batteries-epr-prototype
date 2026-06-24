import { niContent } from '../../../config/ni-content.js'
import { paths } from '../../../config/paths.js'

export const niProductRequirementsController = {
  handler(request, h) {
    const pageContent = niContent.productRequirements

    return h.view('ni/productRequirements/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      intro: pageContent.intro,
      empty: pageContent.empty,
      dashboardUrl: paths.niDashboard
    })
  }
}
