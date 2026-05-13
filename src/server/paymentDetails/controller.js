import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'
import { COMPLIANCE_PERIOD } from '../../config/onboarding-steps.js'

export const paymentDetailsController = {
  handler(request, h) {
    const pageContent = content.paymentDetails(request)

    const pagePayload = {
      signInUrl: paths.signIn,
      dashboardUrl: paths.dashboard,
      compliancePeriod: COMPLIANCE_PERIOD
    }

    return h.view('paymentDetails/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      intro: pageContent.intro,
      labels: pageContent,
      dashboardUrl: paths.dashboard,
      pagePayload
    })
  }
}
