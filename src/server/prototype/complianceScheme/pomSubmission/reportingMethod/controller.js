import joi from 'joi'

import { paths } from '../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'
import { taskFlowPageModel } from '../shared.js'

const schema = joi
  .object({
    reportingMethod: joi.string().valid('single', 'bulk').required()
  })
  .options({ stripUnknown: true })

const pathFor = (path, { year, quarter }) =>
  path.replace('{year}', year).replace('{quarter}', quarter)

const buildViewModel = (
  request,
  pageContent,
  { errorSummary = [], errors = {}, formValues = {}, pagePayload = null } = {}
) => {
  const { year, quarter } = request.params

  return {
    ...taskFlowPageModel(pageContent),
    caption: `${year} ${pageContent.complianceCaption}`,
    backLink: pathFor(paths.prototypeComplianceSchemeSubmissionBeforeYouStart, {
      year,
      quarter
    }),
    action: pathFor(paths.prototypeComplianceSchemeSubmissionReportingMethod, {
      year,
      quarter
    }),
    errorTitle: pageContent.error.title,
    errorSummary,
    errors,
    formValues,
    pagePayload
  }
}

export const reportingMethodController = {
  get: {
    handler(request, h) {
      const pageContent = prototypeComplianceSchemeContent.reportingMethod

      return h.view(
        'prototype/complianceScheme/pomSubmission/reportingMethod/view',
        buildViewModel(request, pageContent)
      )
    }
  },

  post: {
    options: {
      validate: {
        payload: schema,
        failAction: (request, h, _err) => {
          const pageContent = prototypeComplianceSchemeContent.reportingMethod
          const errorList = [
            { text: pageContent.error.message, href: '#reportingMethod' }
          ]

          return h
            .view(
              'prototype/complianceScheme/pomSubmission/reportingMethod/view',
              buildViewModel(request, pageContent, {
                errorSummary: errorList,
                errors: { reportingMethod: pageContent.error.message },
                formValues: request.payload
              })
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const { year, quarter } = request.params
      const pageContent = prototypeComplianceSchemeContent.reportingMethod
      const { reportingMethod } = request.payload

      const nextStep =
        reportingMethod === 'bulk'
          ? pathFor(paths.prototypeComplianceSchemeSubmissionBulkUpload, {
              year,
              quarter
            })
          : null

      return h.view(
        'prototype/complianceScheme/pomSubmission/reportingMethod/view',
        buildViewModel(request, pageContent, {
          formValues: request.payload,
          pagePayload: {
            target: 'save',
            year,
            quarter,
            savedFields: { reportingMethod },
            nextStep
          }
        })
      )
    }
  }
}
