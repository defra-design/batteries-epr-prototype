import { content } from '../../config/content.js'

export const accessibilityController = {
  handler(request, h) {
    const pageContent = content.accessibility(request)

    return h.view('accessibility/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      introParagraph: pageContent.introParagraph
    })
  }
}
