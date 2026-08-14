import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'

export const landingController = {
  handler(request, h) {
    const pageContent = content.landing(request)

    return h.view('landing/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      intro: pageContent.intro,
      areas: pageContent.areas,
      playgroundUrl: paths.playground,
      prototypeUrl: paths.prototype
    })
  }
}
