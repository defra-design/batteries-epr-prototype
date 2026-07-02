import joi from 'joi'

import { config } from '../../config/config.js'
import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'

const passwordSchema = joi.object({
  password: joi.string().allow('').required(),
  returnURL: joi.string().allow('').optional()
})

const safeReturnURL = (value) => {
  if (typeof value === 'string' && /^\/(?!\/)/.test(value)) {
    return value
  }
  return paths.home
}

export const passwordController = {
  get: {
    handler(request, h) {
      const pageContent = content.password(request)
      const [flashedError] = request.yar.flash('passwordError')
      const returnURL = safeReturnURL(request.query.returnURL)

      return h.view('password/index', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        intro: pageContent.intro,
        passwordLabel: pageContent.passwordLabel,
        continueAction: pageContent.continueAction,
        action: paths.password,
        returnURL,
        errorMessage: flashedError ?? null
      })
    }
  },

  post: {
    options: {
      validate: {
        payload: passwordSchema,
        failAction: (request, h, _err) => {
          const pageContent = content.password(request)
          const returnURL = safeReturnURL(request.payload?.returnURL)
          request.yar.flash('passwordError', pageContent.error.message)
          return h
            .redirect(
              `${paths.password}?returnURL=${encodeURIComponent(returnURL)}`
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const pageContent = content.password(request)
      const returnURL = safeReturnURL(request.payload.returnURL)

      if (request.payload.password === config.get('password')) {
        request.yar.set('authenticated', true)
        return h.redirect(returnURL)
      }

      request.yar.flash('passwordError', pageContent.error.message)
      return h.redirect(
        `${paths.password}?returnURL=${encodeURIComponent(returnURL)}`
      )
    }
  }
}
