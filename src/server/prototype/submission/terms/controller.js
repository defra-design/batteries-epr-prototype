import joi from 'joi'

import { paths } from '../../../../config/paths.js'
import { prototypeSubmissionContent } from '../../../../config/prototype-submission-content.js'
import {
  basePageModel,
  errorListToMap,
  flashStepErrors,
  readStepErrors
} from '../shared.js'

const STEP_ID = 'terms'

const schema = joi
  .object({ agree: joi.any().required() })
  .options({ stripUnknown: true })

export const termsController = {
  get: {
    handler(request, h) {
      const pageContent = prototypeSubmissionContent.terms
      const { errors } = readStepErrors(request, STEP_ID)

      return h.view('prototype/submission/terms/view', {
        ...basePageModel(pageContent),
        errorTitle: pageContent.error.title,
        errorSummary: errors || [],
        errors: errorListToMap(errors),
        action: paths.prototypeSubmissionTerms,
        backLink: paths.prototypeSubmissionSignIn
      })
    }
  },

  post: {
    options: {
      validate: {
        payload: schema,
        failAction: (request, h, _err) => {
          const pageContent = prototypeSubmissionContent.terms
          const list = [{ text: pageContent.error.agree, href: '#agree' }]
          flashStepErrors(request, STEP_ID, list, request.payload)
          return h.redirect(paths.prototypeSubmissionTerms).takeover()
        }
      }
    },
    handler(_request, h) {
      return h.redirect(paths.prototypeSubmissionAccount)
    }
  }
}
