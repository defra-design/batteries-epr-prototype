import { niContent } from '../../../config/ni-content.js'
import { paths } from '../../../config/paths.js'

export const niDashboardController = {
  handler(request, h) {
    const pageContent = niContent.dashboard

    return h.view('ni/dashboard/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      intro: pageContent.intro,
      cards: pageContent.cards,
      startUrl: paths.niOnboardingCompanyDetails
    })
  }
}
