import joi from 'joi'

import { niContent } from '../../../../config/ni-content.js'
import { paths } from '../../../../config/paths.js'
import {
  errorListToMap,
  flashErrors,
  nextStepPath,
  readData,
  readErrors,
  saveData
} from '../shared.js'

const STEP_ID = 'batteryPassport'

const LABEL_FIELDS = ['separateCollection', 'capacity', 'ce', 'hazardous']

const truthy = (value) => value === 'on' || value === true || value === 'true'

const schema = joi
  .object({
    passportCarrierId: joi.string().allow('').optional(),
    separateCollection: joi.any().optional(),
    capacity: joi.any().optional(),
    ce: joi.any().optional(),
    hazardous: joi.any().optional(),
    removability: joi.string().valid('yes', 'no', 'na').required()
  })
  .options({ stripUnknown: true })

const buildSaved = (payload) => ({
  passportCarrierId: payload.passportCarrierId ?? '',
  removability: payload.removability,
  ...LABEL_FIELDS.reduce((acc, field) => {
    acc[field] = truthy(payload[field])
    return acc
  }, {})
})

export const batteryPassportController = {
  get: {
    handler(request, h) {
      const pageContent = niContent.onboarding.batteryPassport
      const { errorSummary, values } = readErrors(request, STEP_ID)
      const saved = readData(request).batteryPassport ?? {}

      return h.view('ni/onboarding/batteryPassport/view', {
        pageTitle: pageContent.title,
        heading: pageContent.heading,
        intro: pageContent.intro,
        labels: pageContent,
        errorTitle: pageContent.error.title,
        action: paths.niOnboardingBatteryPassport,
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
        failAction: (request, h, _err) => {
          const pageContent = niContent.onboarding.batteryPassport
          const list = [
            { text: pageContent.error.removability, href: '#removability' }
          ]
          flashErrors(request, STEP_ID, list, request.payload)
          return h.redirect(paths.niOnboardingBatteryPassport).takeover()
        }
      }
    },
    handler(request, h) {
      saveData(request, { batteryPassport: buildSaved(request.payload) })
      return h.redirect(nextStepPath(STEP_ID))
    }
  }
}
