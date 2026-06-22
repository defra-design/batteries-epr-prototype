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

const STEP_ID = 'contactDetails'

const schema = joi.object({
  firstName: joi.string().trim().required(),
  lastName: joi.string().trim().required(),
  position: joi.string().trim().required(),
  email: joi.string().trim().email({ tlds: false }).required(),
  phone: joi.string().trim().required()
})

export const contactDetailsController = {
  get: {
    handler(request, h) {
      const pageContent = niContent.onboarding.contactDetails
      const { errorSummary, values } = readErrors(request, STEP_ID)
      const saved = readData(request).contactDetails ?? {}

      return h.view('ni/onboarding/contactDetails/view', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        intro: pageContent.intro,
        labels: pageContent,
        errorTitle: pageContent.error.title,
        action: paths.niOnboardingContactDetails,
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
          const pageContent = niContent.onboarding.contactDetails
          const list = collectErrors(err, {
            firstName: pageContent.error.firstName,
            lastName: pageContent.error.lastName,
            position: pageContent.error.position,
            email: pageContent.error.email,
            phone: pageContent.error.phone
          })
          flashErrors(request, STEP_ID, list, request.payload)
          return h.redirect(paths.niOnboardingContactDetails).takeover()
        }
      }
    },
    handler(request, h) {
      saveData(request, { contactDetails: request.payload })
      return h.redirect(nextStepPath(STEP_ID))
    }
  }
}
