import { content } from '../../../../config/content.js'
import { paths } from '../../../../config/paths.js'

const detailUrl = (id) =>
  paths.operatorEvidenceDetail.replace('{evidenceId}', id)

export const detailController = {
  get: {
    handler(request, h) {
      const pageContent = content.operator(request).evidencePages.detail
      const { evidenceId } = request.params
      return h.view('operator/evidence/detail/view', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        labels: pageContent,
        listUrl: paths.operatorEvidence,
        action: detailUrl(evidenceId),
        pagePayload: {
          view: 'detail',
          target: 'hydrate',
          evidenceId
        }
      })
    }
  }
}
