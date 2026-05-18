import { content } from '../../../../config/content.js'
import { paths } from '../../../../config/paths.js'
import { getCompliancePeriod } from '../../shared.js'

export const confirmationController = {
  handler(request, h) {
    const pageContent = content.annualReturnIaConfirmation(request)
    const { registrationId } = request.params

    return h.view('annualReturn/ia/confirmation/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      intro: pageContent.intro,
      backToDashboardAction: pageContent.backToDashboardAction,
      dashboardUrl: paths.dashboard,
      bundleName: 'annualReturnIaConfirmation.js',
      pagePayload: {
        step: 'iaConfirmation',
        target: 'hydrate',
        compliancePeriod: getCompliancePeriod(request),
        registrationId,
        signInUrl: paths.signIn
      }
    })
  }
}
