import joi from 'joi'

import { paths } from '../../../../config/paths.js'
import { prototypeRegistrationContent } from '../../../../config/prototype-registration-content.js'
import {
  actionWithReturn,
  basePageModel,
  buildHydrationPayload,
  buildStepPayload,
  collectErrors,
  errorListToMap,
  flashStepErrors,
  readStepErrors,
  returnUrlFromRequest
} from '../shared.js'

const STEP_ID = 'appropriatePerson'

const schema = joi
  .object({
    appropriatePersonName: joi.string().trim().required(),
    appropriatePersonEmail: joi
      .string()
      .trim()
      .email({ tlds: false })
      .required(),
    appropriatePersonRole: joi.string().trim().required()
  })
  .options({ stripUnknown: true })

const renderView = (h, pageContent, action, viewModel) =>
  h.view('prototype/registration/appropriatePerson/view', {
    ...basePageModel(pageContent),
    errorTitle: pageContent.error.title,
    action,
    backLink: paths.prototypeRegistrationAppropriatePersonGuidance,
    ...viewModel
  })

export const appropriatePersonController = {
  get: {
    handler(request, h) {
      const pageContent = prototypeRegistrationContent.appropriatePerson
      const { errors, values } = readStepErrors(request, STEP_ID)
      const returnUrl = returnUrlFromRequest(request)

      return renderView(
        h,
        pageContent,
        actionWithReturn(
          paths.prototypeRegistrationAppropriatePerson,
          returnUrl
        ),
        {
          errorSummary: errors || [],
          errors: errorListToMap(errors),
          formValues: values || {},
          pagePayload: buildHydrationPayload(STEP_ID, {
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
        failAction: (request, h, err) => {
          const pageContent = prototypeRegistrationContent.appropriatePerson
          const list = collectErrors(err, {
            appropriatePersonName: pageContent.error.fullName,
            appropriatePersonEmail: pageContent.error.email,
            appropriatePersonRole: pageContent.error.role
          })
          flashStepErrors(request, STEP_ID, list, request.payload)
          const returnUrl = returnUrlFromRequest(request)
          return h
            .redirect(
              actionWithReturn(
                paths.prototypeRegistrationAppropriatePerson,
                returnUrl
              )
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const pageContent = prototypeRegistrationContent.appropriatePerson
      const returnUrl = returnUrlFromRequest(request)

      return renderView(
        h,
        pageContent,
        actionWithReturn(
          paths.prototypeRegistrationAppropriatePerson,
          returnUrl
        ),
        {
          errorSummary: [],
          errors: {},
          formValues: request.payload,
          pagePayload: buildStepPayload(
            STEP_ID,
            'draft',
            { ...request.payload },
            returnUrl
          )
        }
      )
    }
  }
}
