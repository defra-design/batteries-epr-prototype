import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'
import { getCompliancePeriod } from '../../config/compliance-period.js'

const RETURN_QS = `?return=${encodeURIComponent(paths.account)}`

export const accountController = {
  handler(request, h) {
    const pageContent = content.account(request)

    const editLinks = {
      company: paths.onboardingCompanyDetails + RETURN_QS,
      contact: paths.onboardingContactDetails + RETURN_QS,
      serviceOfNotice: paths.onboardingServiceOfNotice + RETURN_QS,
      batteryTypes: paths.onboardingBatteryTypes + RETURN_QS,
      brandNames: paths.onboardingBrandNames + RETURN_QS,
      scheme: paths.onboardingSchemeSelect + RETURN_QS
    }

    return h.view('account/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      intro: pageContent.intro,
      loadingMessage: pageContent.loadingMessage,
      sections: pageContent.sections,
      editLinks,
      dashboardUrl: paths.dashboard,
      schemeDetailUrl: paths.accountScheme,
      showReset: true,
      pagePayload: {
        signInUrl: paths.signIn,
        dashboardUrl: paths.dashboard,
        compliancePeriod: getCompliancePeriod(request),
        showReset: true,
        sections: pageContent.sections
      }
    })
  }
}
