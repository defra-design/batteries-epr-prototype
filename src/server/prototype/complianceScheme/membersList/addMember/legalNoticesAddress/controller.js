import joi from 'joi'

import { paths } from '../../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../../config/prototype-compliance-scheme-content.js'
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

const STEP_ID = 'legalNoticesAddress'

const schema = joi
  .object({
    legalNoticesPostcode: joi.string().trim().required(),
    legalNoticesBuilding: joi.string().trim().required()
  })
  .options({ stripUnknown: true })

const renderView = (h, pageContent, action, viewModel) =>
  h.view(
    'prototype/complianceScheme/membersList/addMember/legalNoticesAddress/view',
    {
      ...basePageModel(pageContent),
      errorTitle: pageContent.error.title,
      action,
      backLink: paths.prototypeMembersListAddMemberOrganisationType,
      ...viewModel
    }
  )

export const legalNoticesAddressController = {
  get: {
    handler(request, h) {
      const pageContent =
        prototypeComplianceSchemeContent.membersList.addMember
          .legalNoticesAddress
      const { errors, values } = readStepErrors(request, STEP_ID)
      const returnUrl = returnUrlFromRequest(request)

      return renderView(
        h,
        pageContent,
        actionWithReturn(
          paths.prototypeMembersListAddMemberLegalNoticesAddress,
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
          const pageContent =
            prototypeComplianceSchemeContent.membersList.addMember
              .legalNoticesAddress
          const list = collectErrors(err, {
            legalNoticesPostcode: pageContent.error.postcode,
            legalNoticesBuilding: pageContent.error.building
          })
          flashStepErrors(request, STEP_ID, list, request.payload)
          const returnUrl = returnUrlFromRequest(request)
          return h
            .redirect(
              actionWithReturn(
                paths.prototypeMembersListAddMemberLegalNoticesAddress,
                returnUrl
              )
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const pageContent =
        prototypeComplianceSchemeContent.membersList.addMember
          .legalNoticesAddress
      const returnUrl = returnUrlFromRequest(request)

      return renderView(
        h,
        pageContent,
        actionWithReturn(
          paths.prototypeMembersListAddMemberLegalNoticesAddress,
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
