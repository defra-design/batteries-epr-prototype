import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'

export const homeController = {
  handler(request, h) {
    const pageContent = content.home(request)

    return h.view('home/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      intro: pageContent.intro,
      whoCanUse: pageContent.whoCanUse,
      smallProducer: pageContent.smallProducer,
      directRegistrant: pageContent.directRegistrant,
      publicRegisterCta: pageContent.publicRegisterCta,
      signInCta: pageContent.signInCta,
      publicRegisterUrl: paths.publicRegisterSearch,
      signInUrl: paths.signIn
    })
  }
}
