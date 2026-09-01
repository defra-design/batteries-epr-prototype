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

const STEP_ID = 'soleTraderDetails'

const schema = joi
  .object({
    contactFullName: joi.string().trim().required(),
    tradingName: joi.string().trim().allow('').optional(),
    addressPostcode: joi.string().trim().required(),
    addressLine1: joi.string().trim().allow('').optional(),
    addressTown: joi.string().trim().allow('').optional()
  })
  .options({ stripUnknown: true })

const renderView = (h, pageContent, action, viewModel) =>
  h.view('prototype/registration/soleTraderDetails/view', {
    ...basePageModel(pageContent),
    errorTitle: pageContent.error.title,
    action,
    backLink: paths.prototypeRegistrationOrganisationType,
    ...viewModel
  })

export const soleTraderDetailsController = {
  get: {
    handler(request, h) {
      const pageContent = prototypeRegistrationContent.soleTraderDetails
      const { errors, values } = readStepErrors(request, STEP_ID)
      const returnUrl = returnUrlFromRequest(request)

      return renderView(
        h,
        pageContent,
        actionWithReturn(
          paths.prototypeRegistrationSoleTraderDetails,
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
          const pageContent = prototypeRegistrationContent.soleTraderDetails
          const list = collectErrors(err, {
            contactFullName: pageContent.error.fullName,
            addressPostcode: pageContent.error.postcode
          })
          flashStepErrors(request, STEP_ID, list, request.payload)
          const returnUrl = returnUrlFromRequest(request)
          return h
            .redirect(
              actionWithReturn(
                paths.prototypeRegistrationSoleTraderDetails,
                returnUrl
              )
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const pageContent = prototypeRegistrationContent.soleTraderDetails
      const returnUrl = returnUrlFromRequest(request)
      const savedFields = {
        ...request.payload,
        organisationName:
          request.payload.tradingName || request.payload.contactFullName
      }

      return renderView(
        h,
        pageContent,
        actionWithReturn(
          paths.prototypeRegistrationSoleTraderDetails,
          returnUrl
        ),
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
