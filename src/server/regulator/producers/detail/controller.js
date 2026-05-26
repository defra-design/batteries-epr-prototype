import { content } from '../../../../config/content.js'
import { paths } from '../../../../config/paths.js'

export const detailController = {
  handler(request, h) {
    const pageContent = content.regulator(request).producersPages.detail
    const { producerId } = request.params
    return h.view('regulator/producers/detail/view', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      labels: pageContent,
      listUrl: paths.regulatorProducers,
      pagePayload: {
        view: 'detail',
        target: 'hydrate',
        producerId
      }
    })
  }
}
