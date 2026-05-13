import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'

export const signOutController = {
  handler(request, h) {
    const pageContent = content.signOut(request)

    return h.view('signOut/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      fallbackLink: pageContent.fallbackLink,
      signedOutUrl: paths.signedOut
    })
  }
}
