import { content } from '../../../../config/content.js'
import { paths } from '../../../../config/paths.js'

export const detailController = {
  handler(request, h) {
    const pageContent = content.regulator(request).evidenceOverviewPages.detail
    const { evidenceId } = request.params
    return h.view('regulator/evidence/detail/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      labels: pageContent,
      listUrl: paths.regulatorEvidence,
      pagePayload: {
        view: 'detail',
        target: 'hydrate',
        evidenceId
      }
    })
  }
}
