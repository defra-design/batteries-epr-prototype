import { content } from '../../config/content.js'
import { niContent } from '../../config/ni-content.js'
import { paths } from '../../config/paths.js'

export const homeController = {
  handler(request, h) {
    const pageContent = content.home(request)

    return h.view('home/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      intro: pageContent.intro,
      prototypeBanner: pageContent.prototypeBanner,
      journeys: pageContent.journeys,
      producerSignInUrl: paths.signIn,
      publicRegisterUrl: paths.publicRegisterSearch,
      complianceSchemeSignInUrl: paths.complianceSchemeSignIn,
      operatorSignInUrl: paths.operatorSignIn,
      regulatorSignInUrl: paths.regulatorSignIn,
      niJourney: niContent.home,
      niSignInUrl: paths.niSignIn
    })
  }
}
