import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import { getCompliancePeriod } from '../../../config/compliance-period.js'

export const dashboardController = {
  handler(request, h) {
    const pageContent = content.complianceScheme(request)

    const debugEnabled = process.env.PROTOTYPE_DEBUG === 'true'
    const compliancePeriodYear = getCompliancePeriod(request)

    const pagePayload = {
      signInUrl: paths.signIn,
      compliancePeriodYear,
      debug: {
        fastForwardEnabled: debugEnabled,
        fastForwardLabel: pageContent.debug.fastForwardAction,
        fastForwardConfirmation: pageContent.debug.fastForwardConfirmation
      },
      urls: {
        applicationStart: paths.complianceSchemeApplication.replace(
          '{step}',
          'scheme-details'
        ),
        applicationCheckAnswers: paths.complianceSchemeApplication.replace(
          '{step}',
          'check-answers'
        ),
        members: paths.complianceSchemeMembers,
        evidence: paths.complianceSchemeEvidence,
        evidenceAvailability: paths.complianceSchemeEvidenceAvailability,
        quarterly: paths.complianceSchemeQuarterly,
        ia: paths.complianceSchemeIa,
        obligation: paths.complianceSchemeObligation
      },
      copy: pageContent.tiles
    }

    return h.view('complianceScheme/dashboard/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      introParagraph: pageContent.introParagraph,
      switchSchemeAction: pageContent.switchSchemeAction,
      switchSchemeUrl: paths.complianceSchemeSignIn,
      operatorsAction: pageContent.operatorsAction,
      operatorsUrl: paths.complianceSchemeOperators,
      pagePayload
    })
  }
}
