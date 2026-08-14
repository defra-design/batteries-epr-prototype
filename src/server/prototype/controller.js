import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'

export const prototypeController = {
  handler(request, h) {
    const pageContent = content.prototype(request)

    return h.view('prototype/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      intro: pageContent.intro,
      empty: pageContent.empty,
      backLinkText: pageContent.backLinkText,
      homeUrl: paths.home
    })
  }
}
