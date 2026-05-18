import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import { getCompliancePeriod } from '../../../config/compliance-period.js'

export const confirmationController = {
  handler(request, h) {
    const pageContent = content.onboardingConfirmation(request)
    const compliancePeriod = getCompliancePeriod(request)

    return h.view('onboarding/confirmation/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      intro: pageContent.intro.replace('{compliancePeriod}', compliancePeriod),
      labels: pageContent,
      dashboardUrl: paths.dashboard,
      pagePayload: {
        step: 'confirmation',
        target: 'hydrate',
        compliancePeriod
      }
    })
  }
}
