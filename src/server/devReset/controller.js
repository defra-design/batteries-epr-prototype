import { content } from '../../config/content.js'
import { resetStore as resetRegulatorStore } from '../prototype/regulator/pomSubmission/store.js'

export const devResetController = {
  get: {
    handler(request, h) {
      const pageContent = content.devReset(request)

      return h.view('devReset/index', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        body: pageContent.body,
        confirmAction: pageContent.confirmAction
      })
    }
  },

  // Resets server-side state that has no browser storage to clear via the
  // client-side reset — currently just the regulator's in-memory decisions.
  post: {
    handler(request, h) {
      resetRegulatorStore()
      return h.response().code(204)
    }
  }
}
