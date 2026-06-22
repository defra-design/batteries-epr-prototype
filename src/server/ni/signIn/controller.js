import joi from 'joi'

import { niContent } from '../../../config/ni-content.js'
import { paths } from '../../../config/paths.js'

const emailSchema = joi.object({
  email: joi.string().trim().email().required()
})

export const niSignInController = {
  get: {
    handler(request, h) {
      const pageContent = niContent.signIn
      const [flashedError] = request.yar.flash('niSignInError')
      const [flashedEmail] = request.yar.flash('niSignInEmail')

      return h.view('ni/signIn/index', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        intro: pageContent.intro,
        emailLabel: pageContent.emailLabel,
        continueAction: pageContent.continueAction,
        action: paths.niSignIn,
        errorMessage: flashedError ?? null,
        emailValue: flashedEmail ?? ''
      })
    }
  },

  post: {
    options: {
      validate: {
        payload: emailSchema,
        failAction: (request, h, _err) => {
          request.yar.flash('niSignInError', niContent.signIn.error.message)
          request.yar.flash('niSignInEmail', request.payload?.email ?? '')
          return h.redirect(paths.niSignIn).takeover()
        }
      }
    },
    handler(request, h) {
      return h.redirect(paths.niDashboard)
    }
  }
}
