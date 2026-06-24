import { niContent } from '../../../config/ni-content.js'
import { paths } from '../../../config/paths.js'

export const niObligationController = {
  handler(request, h) {
    const pageContent = niContent.obligation

    return h.view('ni/obligation/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      intro: pageContent.intro,
      note: pageContent.note,
      empty: pageContent.empty,
      dashboardUrl: paths.niDashboard
    })
  }
}
