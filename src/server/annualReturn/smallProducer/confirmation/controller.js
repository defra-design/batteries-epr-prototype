import { content } from '../../../../config/content.js'
import { paths } from '../../../../config/paths.js'
import { COMPLIANCE_PERIOD } from '../../shared.js'

export const confirmationController = {
  handler(request, h) {
    const pageContent = content.annualReturnSmallConfirmation(request)
    const { registrationId } = request.params

    return h.view('annualReturn/smallProducer/confirmation/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      intro: pageContent.intro,
      backToDashboardAction: pageContent.backToDashboardAction,
      dashboardUrl: paths.dashboard,
      bundleName: 'annualReturnSmallConfirmation.js',
      pagePayload: {
        step: 'smallProducerConfirmation',
        target: 'hydrate',
        compliancePeriod: COMPLIANCE_PERIOD,
        registrationId
      }
    })
  }
}
