import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'
import { getCompliancePeriod } from '../../config/compliance-period.js'

export const dashboardController = {
  handler(request, h) {
    const pageContent = content.dashboard(request)

    const pagePayload = {
      signInUrl: paths.signIn,
      onboardingStartUrl: paths.onboardingCompanyDetails,
      payServiceChargeUrl: paths.serviceCharge,
      compliancePeriod: getCompliancePeriod(request),
      cards: pageContent.cards
    }

    return h.view('dashboard/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      loadingMessage: pageContent.loadingMessage,
      cards: pageContent.cards,
      pagePayload
    })
  }
}
