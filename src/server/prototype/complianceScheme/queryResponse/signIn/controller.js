import joi from 'joi'

import { paths, pathTo } from '../../../../../config/paths.js'
import { currentReturn } from '../shared.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'

const pageContent = prototypeComplianceSchemeContent.queryResponse.signIn

const schema = joi
  .object({
    email: joi.string().trim().email({ tlds: false }).required(),
    password: joi.string().required()
  })
  .options({ abortEarly: false, stripUnknown: true })

const buildViewModel = ({
  errors = {},
  errorSummary = [],
  email = ''
} = {}) => ({
  pageTitle: errorSummary.length
    ? `Error: ${pageContent.title}`
    : pageContent.title,
  heading: pageContent.heading,
  labels: pageContent,
  // One Login is a separate service, so no service name or navigation here.
  serviceName: '',
  navigation: [],
  action: paths.prototypeComplianceSchemeQueryResponseSignIn,
  errorSummary,
  errors,
  values: { email }
})

const errorKeyFor = (detail) => {
  if (detail.path[0] === 'email' && detail.type === 'string.email') {
    return 'emailFormat'
  }
  return detail.path[0]
}

export const signInController = {
  get: {
    handler(_request, h) {
      return h.view(
        'prototype/complianceScheme/queryResponse/signIn/view',
        buildViewModel()
      )
    }
  },

  post: {
    options: {
      validate: {
        payload: schema,
        failAction: (request, h, err) => {
          const errors = {}
          const errorSummary = []
          for (const detail of err.details) {
            const field = detail.path[0]
            if (errors[field]) {
              continue
            }
            const text = pageContent.error[errorKeyFor(detail)]
            errors[field] = text
            errorSummary.push({ text, href: `#${field}` })
          }

          return h
            .view(
              'prototype/complianceScheme/queryResponse/signIn/view',
              buildViewModel({
                errors,
                errorSummary,
                email: request.payload?.email ?? ''
              })
            )
            .takeover()
        }
      }
    },
    handler(_request, h) {
      const { compliancePeriodYear: year, quarter } = currentReturn()

      return h.redirect(
        pathTo(paths.prototypeComplianceSchemeQueryResponseReturnQueried, {
          year,
          quarter
        })
      )
    }
  }
}
