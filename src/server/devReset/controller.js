import { content } from '../../config/content.js'

export const devResetController = {
  handler(request, h) {
    const pageContent = content.devReset(request)

    return h.view('devReset/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      body: pageContent.body,
      confirmAction: pageContent.confirmAction
    })
  }
}
