import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import { getCompliancePeriod } from '../../../config/compliance-period.js'

export const dashboardController = {
  handler(request, h) {
    const pageContent = content.regulator(request)
    const compliancePeriodYear = getCompliancePeriod(request)

    const pagePayload = {
      signInUrl: paths.regulatorSignIn,
      compliancePeriodYear,
      copy: pageContent.tiles,
      urls: {
        schemes: paths.regulatorSchemes,
        operators: paths.regulatorOperators,
        producers: paths.regulatorProducers,
        evidence: paths.regulatorEvidence,
        submissions: paths.regulatorSubmissions
      }
    }

    return h.view('regulator/dashboard/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      introParagraph: pageContent.introParagraph,
      switchAgencyAction: pageContent.switchAgencyAction,
      configurationHeading: pageContent.configurationHeading,
      targetsAction: pageContent.targetsAction,
      categoriesAction: pageContent.categoriesAction,
      auditTrailAction: pageContent.auditTrailAction,
      regulatorSignInUrl: paths.regulatorSignIn,
      regulatorTargetsUrl: paths.regulatorTargets,
      regulatorCategoriesUrl: paths.regulatorCategories,
      regulatorAuditTrailUrl: paths.regulatorAuditTrail,
      pagePayload
    })
  }
}
