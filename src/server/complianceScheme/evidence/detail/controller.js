import { content } from '../../../../config/content.js'
import { paths } from '../../../../config/paths.js'

const detailUrl = (id) =>
  paths.complianceSchemeEvidenceDetail.replace('{evidenceId}', id)

const transferUrl = (id) =>
  paths.complianceSchemeEvidenceTransfer.replace('{evidenceId}', id)

const renderView = (h, request, pageContent, viewModel) =>
  h.view('complianceScheme/evidence/detail/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    labels: pageContent,
    listUrl: paths.complianceSchemeEvidence,
    ...viewModel
  })

export const detailController = {
  get: {
    handler(request, h) {
      const pageContent = content.complianceScheme(request).evidencePages.detail
      const { evidenceId } = request.params
      return renderView(h, request, pageContent, {
        action: detailUrl(evidenceId),
        transferAction: transferUrl(evidenceId),
        pagePayload: {
          view: 'detail',
          target: 'hydrate',
          evidenceId,
          transferUrl: transferUrl(evidenceId)
        }
      })
    }
  },

  post: {
    handler(request, h) {
      const pageContent = content.complianceScheme(request).evidencePages.detail
      const { evidenceId } = request.params
      const action = request.payload?.action === 'reject' ? 'reject' : 'accept'
      const newStatus = action === 'reject' ? 'cancelled' : 'accepted'
      return renderView(h, request, pageContent, {
        action: detailUrl(evidenceId),
        transferAction: transferUrl(evidenceId),
        pagePayload: {
          view: 'detail',
          target: 'persist',
          evidenceId,
          newStatus,
          next: paths.complianceSchemeEvidence
        }
      })
    }
  }
}
