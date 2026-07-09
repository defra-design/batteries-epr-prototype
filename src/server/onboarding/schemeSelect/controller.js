import { createRequire } from 'node:module'

import joi from 'joi'

import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import {
  actionWithReturn,
  buildHydrationPayload,
  buildStepPayload,
  errorListToMap,
  flashStepErrors,
  isAllowedReturn,
  readStepErrors
} from '../shared.js'

const seedData = createRequire(import.meta.url)(
  '../../../client/javascripts/storage-seed.json'
)

const STEP_ID = 'schemeSelect'

const schema = joi
  .object({
    schemeId: joi.string().uuid().required()
  })
  .options({ stripUnknown: true })

const approvedSchemes = () =>
  seedData.schemes.filter((s) => s.approvalStatus === 'approved')

const returnUrlFromRequest = (request) => {
  const value = request.query?.return
  return isAllowedReturn(value) ? value : null
}

const renderView = (h, pageContent, action, viewModel) =>
  h.view('onboarding/schemeSelect/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    errorTitle: pageContent.error.title,
    action,
    ...viewModel
  })

export const schemeSelectController = {
  get: {
    handler(request, h) {
      const pageContent = content.onboardingSchemeSelect(request)
      const { errors, values } = readStepErrors(request, STEP_ID)
      const returnUrl = returnUrlFromRequest(request)

      return renderView(
        h,
        pageContent,
        actionWithReturn(paths.onboardingSchemeSelect, returnUrl),
        {
          errorSummary: errors || [],
          errors: errorListToMap(errors),
          formValues: values || {},
          schemes: approvedSchemes(),
          pagePayload: buildHydrationPayload(request, STEP_ID, {
            skipHydration: !!errors
          })
        }
      )
    }
  },

  post: {
    options: {
      validate: {
        payload: schema,
        failAction: (request, h, _err) => {
          const pageContent = content.onboardingSchemeSelect(request)
          const list = [{ text: pageContent.error.choice, href: '#schemeId' }]
          flashStepErrors(request, STEP_ID, list, request.payload)
          const returnUrl = returnUrlFromRequest(request)
          return h
            .redirect(actionWithReturn(paths.onboardingSchemeSelect, returnUrl))
            .takeover()
        }
      }
    },
    handler(request, h) {
      const pageContent = content.onboardingSchemeSelect(request)
      const returnUrl = returnUrlFromRequest(request)
      const savedFields = { schemeId: request.payload.schemeId }

      return renderView(
        h,
        pageContent,
        actionWithReturn(paths.onboardingSchemeSelect, returnUrl),
        {
          errorSummary: [],
          errors: {},
          formValues: request.payload,
          schemes: approvedSchemes(),
          pagePayload: buildStepPayload(
            request,
            STEP_ID,
            'registration',
            savedFields,
            returnUrl || paths.onboardingSchemeConfirm
          )
        }
      )
    }
  }
}
