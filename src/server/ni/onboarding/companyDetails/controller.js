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

const STEP_ID = 'companyDetails'

const schema = joi.object({
  companyName: joi.string().trim().required(),
  companyRegistrationNo: joi.string().trim().required(),
  line1: joi.string().trim().required(),
  town: joi.string().trim().required(),
  postcode: joi.string().trim().required()
})

export const companyDetailsController = {
  get: {
    handler(request, h) {
      const pageContent = niContent.onboarding.companyDetails
      const { errorSummary, values } = readErrors(request, STEP_ID)
      const saved = readData(request).companyDetails ?? {}

      return h.view('ni/onboarding/companyDetails/view', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        intro: pageContent.intro,
        labels: pageContent,
        errorTitle: pageContent.error.title,
        action: paths.niOnboardingCompanyDetails,
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
          const pageContent = niContent.onboarding.companyDetails
          const list = collectErrors(err, {
            companyName: pageContent.error.companyName,
            companyRegistrationNo: pageContent.error.companyRegistrationNo,
            line1: pageContent.error.line1,
            town: pageContent.error.town,
            postcode: pageContent.error.postcode
          })
          flashErrors(request, STEP_ID, list, request.payload)
          return h.redirect(paths.niOnboardingCompanyDetails).takeover()
        }
      }
    },
    handler(request, h) {
      saveData(request, { companyDetails: request.payload })
      return h.redirect(nextStepPath(STEP_ID))
    }
  }
}
