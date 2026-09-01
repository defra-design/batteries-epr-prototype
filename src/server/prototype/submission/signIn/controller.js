import { paths } from '../../../../config/paths.js'
import { prototypeSubmissionContent } from '../../../../config/prototype-submission-content.js'
import { basePageModel } from '../shared.js'

export const signInController = {
  get: {
    handler(_request, h) {
      const pageContent = prototypeSubmissionContent.signIn

      return h.view('prototype/submission/signIn/view', {
        ...basePageModel(pageContent),
        breadcrumbs: prototypeSubmissionContent.breadcrumbs,
        action: paths.prototypeSubmissionSignIn
      })
    }
  },

  post: {
    handler(_request, h) {
      return h.redirect(paths.prototypeSubmissionTerms)
    }
  }
}
