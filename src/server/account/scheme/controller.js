import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import { getCompliancePeriod } from '../../../config/compliance-period.js'

const RETURN_QS = `?return=${encodeURIComponent(paths.accountScheme)}`

export const accountSchemeController = {
  handler(request, h) {
    const pageContent = content.accountScheme(request)

    return h.view('account/scheme/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      intro: pageContent.intro,
      loadingMessage: pageContent.loadingMessage,
      labels: pageContent,
      editLinks: {
        scheme: paths.onboardingSchemeSelect + RETURN_QS
      },
      leaveSchemeUrl: paths.leaveSchemeReason,
      backToAccountUrl: paths.account,
      pagePayload: {
        signInUrl: paths.signIn,
        compliancePeriod: getCompliancePeriod(request),
        accountUrl: paths.account,
        labels: pageContent
      }
    })
  }
}
