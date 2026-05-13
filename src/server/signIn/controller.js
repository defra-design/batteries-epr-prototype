import joi from 'joi'

import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'

const emailSchema = joi.object({
  email: joi.string().trim().email().required()
})

export const signInController = {
  get: {
    handler(request, h) {
      const pageContent = content.signIn(request)
      const [flashedError] = request.yar.flash('signInError')
      const [flashedEmail] = request.yar.flash('signInEmail')

      return h.view('signIn/index', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        intro: pageContent.intro,
        emailLabel: pageContent.emailLabel,
        continueAction: pageContent.continueAction,
        action: paths.signIn,
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
          const pageContent = content.signIn(request)
          request.yar.flash('signInError', pageContent.error.message)
          request.yar.flash('signInEmail', request.payload?.email ?? '')
          return h.redirect(paths.signIn).takeover()
        }
      }
    },
    handler(request, h) {
      const email = request.payload.email.trim().toLowerCase()
      const pageContent = content.signIn(request)

      return h.view('signIn/success', {
        pageTitle: pageContent.title,
        heading: 'Signing you in',
        dashboardUrl: paths.dashboard,
        pagePayload: { email }
      })
    }
  }
}
