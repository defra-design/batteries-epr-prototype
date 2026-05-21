import joi from 'joi'

import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'

const REASONS = [
  'joinedAnotherScheme',
  'belowThreshold',
  'ceasedTrading',
  'other'
]

const schema = joi
  .object({
    reasonForLeaving: joi
      .string()
      .valid(...REASONS)
      .required(),
    otherReason: joi.string().trim().allow('').max(500).optional()
  })
  .custom((value, helpers) => {
    if (value.reasonForLeaving === 'other' && !value.otherReason) {
      return helpers.error('otherRequired')
    }
    return value
  })
  .messages({ otherRequired: 'otherRequired' })
  .options({ stripUnknown: true })

const renderView = (h, request, viewModel) => {
  const pageContent = content.leaveSchemeReason(request)
  return h.view('leaveScheme/reason/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    errorTitle: pageContent.error.title,
    action: paths.leaveSchemeReason,
    accountUrl: paths.account,
    ...viewModel
  })
}

export const reasonController = {
  get: {
    handler(request, h) {
      return renderView(h, request, {
        errorSummary: [],
        errors: {},
        formValues: {},
        pagePayload: {
          step: 'leaveSchemeReason',
          target: 'hydrate'
        }
      })
    }
  },
  post: {
    options: {
      validate: {
        payload: schema,
        failAction(request, h, err) {
          const pageContent = content.leaveSchemeReason(request)
          const firstDetail = err.details[0]
          const text =
            firstDetail.type === 'otherRequired'
              ? pageContent.error.otherRequired
              : pageContent.error.choice
          const href =
            firstDetail.type === 'otherRequired'
              ? '#otherReason'
              : '#reasonForLeaving'
          return renderView(h, request, {
            errorSummary: [{ text, href }],
            errors: { [href.slice(1)]: text },
            formValues: request.payload,
            pagePayload: {
              step: 'leaveSchemeReason',
              target: 'hydrate',
              skipHydration: true
            }
          }).takeover()
        }
      }
    },
    handler(request, h) {
      const payload = request.payload
      return renderView(h, request, {
        errorSummary: [],
        errors: {},
        formValues: payload,
        pagePayload: {
          step: 'leaveSchemeReason',
          target: 'saveDraft',
          savedFields: {
            reasonForLeaving: payload.reasonForLeaving,
            otherReason: payload.otherReason ?? ''
          },
          nextStep: paths.leaveSchemeDeclaration
        }
      })
    }
  }
}
