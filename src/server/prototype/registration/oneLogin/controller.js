import { paths } from '../../../../config/paths.js'
import { prototypeRegistrationContent } from '../../../../config/prototype-registration-content.js'
import { basePageModel } from '../shared.js'

export const oneLoginController = {
  handler(_request, h) {
    const pageContent = prototypeRegistrationContent.oneLogin

    return h.view('prototype/registration/oneLogin/view', {
      ...basePageModel(pageContent),
      signInUrl: paths.prototypeRegistrationSignIn,
      backLink: paths.prototypeRegistrationStart
    })
  }
}
