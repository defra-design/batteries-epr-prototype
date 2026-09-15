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

const STEP_ID = 'companiesHouse'

const schema = joi
  .object({
    organisationName: joi.string().trim().required(),
    companyNumber: joi
      .string()
      .trim()
      .pattern(/^\d{8}$/)
      .required(),
    addressLine1: joi.string().trim().allow('').optional(),
    addressTown: joi.string().trim().allow('').optional(),
    addressPostcode: joi.string().trim().allow('').optional()
  })
  .options({ stripUnknown: true })

const renderView = (h, pageContent, action, viewModel) =>
  h.view(
    'prototype/complianceScheme/membersList/addMember/companiesHouse/view',
    {
      ...basePageModel(pageContent),
      errorTitle: pageContent.error.title,
      action,
      backLink: paths.prototypeMembersListAddMemberOrganisationType,
      ...viewModel
    }
  )

export const companiesHouseController = {
  get: {
    handler(request, h) {
      const pageContent =
        prototypeComplianceSchemeContent.membersList.addMember.companiesHouse
      const { errors, values } = readStepErrors(request, STEP_ID)
      const returnUrl = returnUrlFromRequest(request)

      return renderView(
        h,
        pageContent,
        actionWithReturn(
          paths.prototypeMembersListAddMemberCompaniesHouse,
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
              .companiesHouse
          const list = collectErrors(err, {
            organisationName: pageContent.error.name,
            companyNumber: pageContent.error.number
          })
          flashStepErrors(request, STEP_ID, list, request.payload)
          const returnUrl = returnUrlFromRequest(request)
          return h
            .redirect(
              actionWithReturn(
                paths.prototypeMembersListAddMemberCompaniesHouse,
                returnUrl
              )
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const pageContent =
        prototypeComplianceSchemeContent.membersList.addMember.companiesHouse
      const returnUrl = returnUrlFromRequest(request)
      const {
        organisationName,
        companyNumber,
        addressLine1,
        addressTown,
        addressPostcode
      } = request.payload

      return renderView(
        h,
        pageContent,
        actionWithReturn(
          paths.prototypeMembersListAddMemberCompaniesHouse,
          returnUrl
        ),
        {
          errorSummary: [],
          errors: {},
          formValues: request.payload,
          pagePayload: buildStepPayload(
            STEP_ID,
            'draft',
            {
              organisationName,
              companyNumber,
              addressLine1,
              addressTown,
              addressPostcode
            },
            returnUrl
          )
        }
      )
    }
  }
}
