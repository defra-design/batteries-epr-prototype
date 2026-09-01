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

const STEP_ID = 'partnershipDetails'

const schema = joi
  .object({
    contactFullName: joi.string().trim().required(),
    organisationName: joi.string().trim().required(),
    tradingName: joi.string().trim().allow('').optional(),
    addressPostcode: joi.string().trim().required(),
    addressLine1: joi.string().trim().allow('').optional(),
    addressTown: joi.string().trim().allow('').optional()
  })
  .options({ stripUnknown: true })

const renderView = (h, pageContent, action, viewModel) =>
  h.view('prototype/registration/partnershipDetails/view', {
    ...basePageModel(pageContent),
    errorTitle: pageContent.error.title,
    action,
    backLink: paths.prototypeRegistrationOrganisationType,
    showPartnershipName: true,
    ...viewModel
  })

export const partnershipDetailsController = {
  get: {
    handler(request, h) {
      const pageContent = prototypeRegistrationContent.partnershipDetails
      const { errors, values } = readStepErrors(request, STEP_ID)
      const returnUrl = returnUrlFromRequest(request)

      return renderView(
        h,
        pageContent,
        actionWithReturn(
          paths.prototypeRegistrationPartnershipDetails,
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
          const pageContent = prototypeRegistrationContent.partnershipDetails
          const list = collectErrors(err, {
            contactFullName: pageContent.error.fullName,
            organisationName: pageContent.error.partnershipName,
            addressPostcode: pageContent.error.postcode
          })
          flashStepErrors(request, STEP_ID, list, request.payload)
          const returnUrl = returnUrlFromRequest(request)
          return h
            .redirect(
              actionWithReturn(
                paths.prototypeRegistrationPartnershipDetails,
                returnUrl
              )
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const pageContent = prototypeRegistrationContent.partnershipDetails
      const returnUrl = returnUrlFromRequest(request)

      return renderView(
        h,
        pageContent,
        actionWithReturn(
          paths.prototypeRegistrationPartnershipDetails,
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
