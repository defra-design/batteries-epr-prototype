import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'
import { getCompliancePeriod } from '../../config/compliance-period.js'

export const serviceChargeController = {
  handler(request, h) {
    const pageContent = content.serviceCharge(request)

    const pagePayload = {
      signInUrl: paths.signIn,
      paymentDetailsUrl: paths.paymentDetails,
      dashboardUrl: paths.dashboard,
      compliancePeriod: getCompliancePeriod(request),
      labels: {
        organisationLabel: pageContent.organisationLabel,
        feeLabel: pageContent.feeLabel,
        complianceLabel: pageContent.complianceLabel,
        smallProducerNote: pageContent.smallProducerNote,
        directRegistrantNote: pageContent.directRegistrantNote,
        processing: pageContent.processing
      }
    }

    return h.view('serviceCharge/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      intro: pageContent.intro,
      labels: pageContent,
      dashboardUrl: paths.dashboard,
      pagePayload
    })
  }
}
