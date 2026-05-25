import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import { getCompliancePeriod } from '../../../config/compliance-period.js'

export const dashboardController = {
  handler(request, h) {
    const pageContent = content.operator(request)

    const debugEnabled = process.env.PROTOTYPE_DEBUG === 'true'
    const compliancePeriodYear = getCompliancePeriod(request)

    const pagePayload = {
      signInUrl: paths.operatorSignIn,
      compliancePeriodYear,
      urls: {
        applicationStart: paths.operatorApplication.replace(
          '{step}',
          'operator-details'
        ),
        applicationCheckAnswers: paths.operatorApplication.replace(
          '{step}',
          'declaration'
        ),
        evidence: paths.operatorEvidence,
        evidenceIssue: paths.operatorEvidenceIssue.replace('{step}', 'scheme'),
        quarterly: paths.operatorQuarterly,
        annualReturn: paths.operatorAnnualReturn
      },
      debug: {
        fastForwardEnabled: debugEnabled,
        fastForwardLabel: pageContent.debug.fastForwardAction,
        fastForwardConfirmation: pageContent.debug.fastForwardConfirmation
      },
      copy: pageContent.tiles
    }

    return h.view('operator/dashboard/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      introParagraph: pageContent.introParagraph,
      switchOperatorAction: pageContent.switchOperatorAction,
      switchOperatorUrl: paths.operatorSignIn,
      pagePayload
    })
  }
}
