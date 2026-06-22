import joi from 'joi'

import { niContent } from '../../../../config/ni-content.js'
import { paths } from '../../../../config/paths.js'
import {
  collectErrors,
  errorListToMap,
  flashErrors,
  nextStepPath,
  readData,
  readErrors,
  saveData
} from '../shared.js'

const STEP_ID = 'declaration'

const schema = joi.object({
  firstName: joi.string().trim().required(),
  lastName: joi.string().trim().required(),
  position: joi.string().trim().required(),
  confirm: joi.valid('on').required()
})

export const declarationController = {
  get: {
    handler(request, h) {
      const pageContent = niContent.onboarding.declaration
      const { errorSummary, values } = readErrors(request, STEP_ID)
      const saved = readData(request).declaration ?? {}

      return h.view('ni/onboarding/declaration/view', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        intro: pageContent.intro,
        labels: pageContent,
        errorTitle: pageContent.error.title,
        action: paths.niOnboardingDeclaration,
        errorSummary,
        errors: errorListToMap(errorSummary),
        formValues: values ?? saved
      })
    }
  },

  post: {
    options: {
      validate: {
        payload: schema,
        options: { abortEarly: false, stripUnknown: true },
        failAction: (request, h, err) => {
          const pageContent = niContent.onboarding.declaration
          const list = collectErrors(err, {
            firstName: pageContent.error.firstName,
            lastName: pageContent.error.lastName,
            position: pageContent.error.position,
            confirm: pageContent.error.confirm
          })
          flashErrors(request, STEP_ID, list, request.payload)
          return h.redirect(paths.niOnboardingDeclaration).takeover()
        }
      }
    },
    handler(request, h) {
      saveData(request, {
        declaration: {
          firstName: request.payload.firstName,
          lastName: request.payload.lastName,
          position: request.payload.position
        }
      })
      return h.redirect(nextStepPath(STEP_ID))
    }
  }
}
