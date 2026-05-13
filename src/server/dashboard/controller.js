import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'
import { COMPLIANCE_PERIOD } from '../../config/onboarding-steps.js'

export const dashboardController = {
  handler(request, h) {
    const pageContent = content.dashboard(request)

    const pagePayload = {
      signInUrl: paths.signIn,
      onboardingStartUrl: paths.onboardingCompanyDetails,
      payServiceChargeUrl: paths.serviceCharge,
      compliancePeriod: COMPLIANCE_PERIOD,
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
