import { content } from '../../../../config/content.js'
import { paths } from '../../../../config/paths.js'

const renderView = (h, request, pageContent, viewModel) =>
  h.view('regulator/schemes/detail/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    labels: pageContent,
    listUrl: paths.regulatorSchemes,
    ...viewModel
  })

export const detailController = {
  get: {
    handler(request, h) {
      const pageContent = content.regulator(request).schemesPages.detail
      const { schemeId } = request.params
      return renderView(h, request, pageContent, {
        pagePayload: {
          view: 'detail',
          target: 'hydrate',
          schemeId
        }
      })
    }
  },

  post: {
    handler(request, h) {
      const pageContent = content.regulator(request).schemesPages.detail
      const { schemeId } = request.params
      const action = request.payload?.action === 'reject' ? 'reject' : 'approve'
      const approvalNumber = request.payload?.approvalNumber ?? null
      return renderView(h, request, pageContent, {
        pagePayload: {
          view: 'detail',
          target: 'persist',
          schemeId,
          action,
          approvalNumber
        }
      })
    }
  }
}
