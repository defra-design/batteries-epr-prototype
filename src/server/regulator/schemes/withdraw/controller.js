import { content } from '../../../../config/content.js'
import { paths } from '../../../../config/paths.js'

const renderView = (h, request, pageContent, viewModel) =>
  h.view('regulator/schemes/withdraw/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    listUrl: paths.regulatorSchemes,
    ...viewModel
  })

export const withdrawController = {
  get: {
    handler(request, h) {
      const pageContent = content.regulator(request).schemesPages.withdraw
      const { schemeId } = request.params
      return renderView(h, request, pageContent, {
        pagePayload: {
          view: 'withdraw',
          target: 'hydrate',
          schemeId
        }
      })
    }
  },

  post: {
    handler(request, h) {
      const pageContent = content.regulator(request).schemesPages.withdraw
      const { schemeId } = request.params
      const reason = request.payload?.reason ?? ''
      return renderView(h, request, pageContent, {
        pagePayload: {
          view: 'withdraw',
          target: 'persist',
          schemeId,
          reason
        }
      })
    }
  }
}
