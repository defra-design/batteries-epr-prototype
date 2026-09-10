import { paths } from '../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'

export const signInController = {
  get: {
    handler(_request, h) {
      const pageContent = prototypeComplianceSchemeContent.signIn

      return h.view('prototype/complianceScheme/pomSubmission/signIn/view', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        labels: pageContent,
        serviceName: '',
        navigation: [],
        action: paths.prototypeComplianceSchemeSubmissionSignIn
      })
    }
  },

  post: {
    handler(_request, h) {
      return h.redirect(paths.prototypeComplianceSchemeSubmissionDashboard)
    }
  }
}
