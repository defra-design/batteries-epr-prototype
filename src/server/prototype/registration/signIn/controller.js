import { paths } from '../../../../config/paths.js'
import { prototypeRegistrationContent } from '../../../../config/prototype-registration-content.js'
import { basePageModel } from '../shared.js'

export const signInController = {
  get: {
    handler(_request, h) {
      const pageContent = prototypeRegistrationContent.signIn

      return h.view('prototype/registration/signIn/view', {
        ...basePageModel(pageContent),
        action: paths.prototypeRegistrationSignIn,
        backLink: paths.prototypeRegistrationOneLogin
      })
    }
  },

  post: {
    handler(_request, h) {
      return h.redirect(paths.prototypeRegistrationBatteryCategory)
    }
  }
}
