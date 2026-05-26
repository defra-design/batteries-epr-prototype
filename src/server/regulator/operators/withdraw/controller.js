import { content } from '../../../../config/content.js'
import { paths } from '../../../../config/paths.js'

const renderView = (h, request, pageContent, viewModel) =>
  h.view('regulator/operators/withdraw/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    listUrl: paths.regulatorOperators,
    ...viewModel
  })

export const withdrawController = {
  get: {
    handler(request, h) {
      const pageContent = content.regulator(request).operatorsPages.withdraw
      const { operatorId } = request.params
      return renderView(h, request, pageContent, {
        pagePayload: {
          view: 'withdraw',
          target: 'hydrate',
          operatorId
        }
      })
    }
  },

  post: {
    handler(request, h) {
      const pageContent = content.regulator(request).operatorsPages.withdraw
      const { operatorId } = request.params
      const reason = request.payload?.reason ?? ''
      return renderView(h, request, pageContent, {
        pagePayload: {
          view: 'withdraw',
          target: 'persist',
          operatorId,
          reason
        }
      })
    }
  }
}
