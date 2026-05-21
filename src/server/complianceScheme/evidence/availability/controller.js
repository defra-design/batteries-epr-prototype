import { content } from '../../../../config/content.js'
import { paths } from '../../../../config/paths.js'

const renderView = (h, request, pageContent, viewModel) =>
  h.view('complianceScheme/evidence/availability/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    cancelUrl: paths.complianceSchemeEvidence,
    action: paths.complianceSchemeEvidenceAvailability,
    ...viewModel
  })

export const availabilityController = {
  get: {
    handler(request, h) {
      const pageContent =
        content.complianceScheme(request).evidencePages.availability
      return renderView(h, request, pageContent, {
        pagePayload: { view: 'availability', target: 'hydrate' }
      })
    }
  },

  post: {
    handler(request, h) {
      const pageContent =
        content.complianceScheme(request).evidencePages.availability
      return renderView(h, request, pageContent, {
        pagePayload: {
          view: 'availability',
          target: 'persist',
          next: paths.complianceSchemeEvidence
        }
      })
    }
  }
}
