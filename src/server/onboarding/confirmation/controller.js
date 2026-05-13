import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import { COMPLIANCE_PERIOD } from '../../../config/onboarding-steps.js'

export const confirmationController = {
  handler(request, h) {
    const pageContent = content.onboardingConfirmation(request)

    return h.view('onboarding/confirmation/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      intro: pageContent.intro.replace('{compliancePeriod}', COMPLIANCE_PERIOD),
      labels: pageContent,
      dashboardUrl: paths.dashboard,
      pagePayload: {
        step: 'confirmation',
        target: 'hydrate',
        compliancePeriod: COMPLIANCE_PERIOD
      }
    })
  }
}
