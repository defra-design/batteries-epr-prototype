import { paths } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'

export const signInController = {
  get: {
    handler(_request, h) {
      const pageContent = prototypeRegulatorContent.signIn

      return h.view('prototype/regulator/pomSubmission/signIn/view', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        labels: pageContent,
        serviceName: '',
        navigation: [],
        action: paths.prototypeRegulatorPomSubmissionSignIn
      })
    }
  },

  post: {
    handler(_request, h) {
      return h.redirect(paths.prototypeRegulatorPomSubmissionDashboard)
    }
  }
}
