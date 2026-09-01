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

const STEP_ID = 'overseasDetails'

const schema = joi
  .object({
    overseasName: joi.string().trim().required(),
    overseasAddress: joi.string().trim().required(),
    addressPostcode: joi.string().trim().required()
  })
  .options({ stripUnknown: true })

const renderView = (h, pageContent, action, viewModel) =>
  h.view('prototype/registration/overseasDetails/view', {
    ...basePageModel(pageContent),
    errorTitle: pageContent.error.title,
    action,
    backLink: paths.prototypeRegistrationOrganisationType,
    noUkPresenceUrl: paths.prototypeRegistrationOverseasExit,
    ...viewModel
  })

export const overseasDetailsController = {
  get: {
    handler(request, h) {
      const pageContent = prototypeRegistrationContent.overseasDetails
      const { errors, values } = readStepErrors(request, STEP_ID)
      const returnUrl = returnUrlFromRequest(request)

      return renderView(
        h,
        pageContent,
        actionWithReturn(paths.prototypeRegistrationOverseasDetails, returnUrl),
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
          const pageContent = prototypeRegistrationContent.overseasDetails
          const list = collectErrors(err, {
            overseasName: pageContent.error.overseasName,
            overseasAddress: pageContent.error.overseasAddress,
            addressPostcode: pageContent.error.postcode
          })
          flashStepErrors(request, STEP_ID, list, request.payload)
          const returnUrl = returnUrlFromRequest(request)
          return h
            .redirect(
              actionWithReturn(
                paths.prototypeRegistrationOverseasDetails,
                returnUrl
              )
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const pageContent = prototypeRegistrationContent.overseasDetails
      const returnUrl = returnUrlFromRequest(request)
      const savedFields = {
        ...request.payload,
        organisationName: request.payload.overseasName
      }

      return renderView(
        h,
        pageContent,
        actionWithReturn(paths.prototypeRegistrationOverseasDetails, returnUrl),
        {
          errorSummary: [],
          errors: {},
          formValues: request.payload,
          pagePayload: buildStepPayload(
            STEP_ID,
            'draft',
            savedFields,
            returnUrl
          )
        }
      )
    }
  }
}
