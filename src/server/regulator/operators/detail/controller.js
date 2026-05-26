import { content } from '../../../../config/content.js'
import { paths } from '../../../../config/paths.js'

const renderView = (h, request, pageContent, viewModel) =>
  h.view('regulator/operators/detail/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    labels: pageContent,
    listUrl: paths.regulatorOperators,
    ...viewModel
  })

export const detailController = {
  get: {
    handler(request, h) {
      const pageContent = content.regulator(request).operatorsPages.detail
      const { operatorId } = request.params
      return renderView(h, request, pageContent, {
        pagePayload: {
          view: 'detail',
          target: 'hydrate',
          operatorId
        }
      })
    }
  },

  post: {
    handler(request, h) {
      const pageContent = content.regulator(request).operatorsPages.detail
      const { operatorId } = request.params
      const action = request.payload?.action === 'reject' ? 'reject' : 'approve'
      const approvalNumber = request.payload?.approvalNumber ?? null
      return renderView(h, request, pageContent, {
        pagePayload: {
          view: 'detail',
          target: 'persist',
          operatorId,
          action,
          approvalNumber
        }
      })
    }
  }
}
