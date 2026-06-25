import { content } from '../../config/content.js'

export const devDataController = {
  handler(request, h) {
    const pageContent = content.devData(request)

    return h.view('devData/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      body: pageContent.body
    })
  }
}
