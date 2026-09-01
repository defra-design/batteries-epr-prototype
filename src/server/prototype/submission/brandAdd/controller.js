import joi from 'joi'

import { paths } from '../../../../config/paths.js'
import { prototypeSubmissionContent } from '../../../../config/prototype-submission-content.js'
import {
  basePageModel,
  buildHydrationPayload,
  buildStepPayload,
  errorListToMap,
  flashStepErrors,
  readStepErrors
} from '../shared.js'

const STEP_ID = 'brandAdd'

const schema = joi
  .object({
    brandNames: joi
      .alternatives()
      .try(joi.string(), joi.array().items(joi.string().allow('')))
      .required()
  })
  .options({ stripUnknown: true })

const normaliseBrandNames = (value) =>
  [value]
    .flat()
    .map((name) => String(name).trim())
    .filter(Boolean)

const renderView = (h, pageContent, viewModel) =>
  h.view('prototype/submission/brandAdd/view', {
    ...basePageModel(pageContent),
    errorTitle: pageContent.error.title,
    action: paths.prototypeSubmissionBrandAdd,
    backLink: paths.prototypeSubmissionBrandQuestion,
    accountUrl: paths.prototypeSubmissionAccount,
    ...viewModel
  })

export const brandAddController = {
  get: {
    handler(request, h) {
      const pageContent = prototypeSubmissionContent.brandAdd
      const { errors } = readStepErrors(request, STEP_ID)

      return renderView(h, pageContent, {
        errorSummary: errors || [],
        errors: errorListToMap(errors),
        pagePayload: buildHydrationPayload(STEP_ID, {
          skipHydration: !!errors
        })
      })
    }
  },

  post: {
    options: {
      validate: {
        payload: schema,
        failAction: (request, h, _err) => {
          const pageContent = prototypeSubmissionContent.brandAdd
          const list = [{ text: pageContent.error.brand, href: '#brandNames' }]
          flashStepErrors(request, STEP_ID, list, request.payload)
          return h.redirect(paths.prototypeSubmissionBrandAdd).takeover()
        }
      }
    },
    handler(request, h) {
      const pageContent = prototypeSubmissionContent.brandAdd
      const brandNames = normaliseBrandNames(request.payload.brandNames)

      if (!brandNames.length) {
        const list = [{ text: pageContent.error.brand, href: '#brandNames' }]
        flashStepErrors(request, STEP_ID, list, request.payload)
        return h.redirect(paths.prototypeSubmissionBrandAdd)
      }

      return renderView(h, pageContent, {
        errorSummary: [],
        errors: {},
        pagePayload: buildStepPayload(STEP_ID, 'submission', { brandNames })
      })
    }
  }
}
