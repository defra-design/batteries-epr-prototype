import { content } from '../../config/content.js'

export const aboutController = {
  handler(request, h) {
    const pageContent = content.about(request)

    return h.view('about/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      body: pageContent.body
    })
  }
}
