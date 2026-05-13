import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'
import { config } from '../../config/config.js'
import { COMPLIANCE_PERIOD } from '../../config/onboarding-steps.js'

const RETURN_QS = `?return=${encodeURIComponent(paths.account)}`

export const accountController = {
  handler(request, h) {
    const pageContent = content.account(request)
    const showReset = !config.get('isProduction')

    const editLinks = {
      company: paths.onboardingCompanyDetails + RETURN_QS,
      contact: paths.onboardingContactDetails + RETURN_QS,
      serviceOfNotice: paths.onboardingServiceOfNotice + RETURN_QS,
      batteryTypes: paths.onboardingBatteryTypes + RETURN_QS,
      brandNames: paths.onboardingBrandNames + RETURN_QS
    }

    return h.view('account/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      intro: pageContent.intro,
      loadingMessage: pageContent.loadingMessage,
      sections: pageContent.sections,
      editLinks,
      dashboardUrl: paths.dashboard,
      showReset,
      pagePayload: {
        signInUrl: paths.signIn,
        dashboardUrl: paths.dashboard,
        compliancePeriod: COMPLIANCE_PERIOD,
        showReset,
        sections: pageContent.sections
      }
    })
  }
}
