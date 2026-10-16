import { paths } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'

// Reuses the regulator sign-in screen from the PoM submission journey, which
// is identical in Figma — only where it sends you afterwards differs.
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
        action: paths.prototypeRegulatorWasteReturnsSignIn
      })
    }
  },

  post: {
    handler(_request, h) {
      return h.redirect(paths.prototypeRegulatorWasteReturnsHome)
    }
  }
}
