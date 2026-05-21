import joi from 'joi'

import { content } from '../../../../config/content.js'
import { paths } from '../../../../config/paths.js'
import {
  errorListToMap,
  flashStepErrors,
  readStepErrors
} from '../../application/shared.js'

const STEP_ID = 'members-add'
const BPRN_PATTERN = /^BPRN-[A-Z]{2,4}-\d{4}-\d{6}$/

const schema = joi
  .object({
    bprn: joi.string().trim().pattern(BPRN_PATTERN).required(),
    companyName: joi.string().trim().min(1).required()
  })
  .options({ stripUnknown: true })

const fieldMessages = (errorContent) => ({
  bprn: errorContent.bprn,
  companyName: errorContent.companyName
})

const renderView = (h, request, pageContent, viewModel) =>
  h.view('complianceScheme/members/add/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    errorTitle: content.complianceScheme(request).application.errorTitle,
    cancelUrl: paths.complianceSchemeMembers,
    action: paths.complianceSchemeMembersAdd,
    ...viewModel
  })

export const addController = {
  get: {
    handler(request, h) {
      const pageContent = content.complianceScheme(request).membersPages.add
      const { errors, values } = readStepErrors(request, STEP_ID)
      return renderView(h, request, pageContent, {
        errorSummary: errors || [],
        errors: errorListToMap(errors),
        formValues: values || {},
        pagePayload: { view: 'add', target: 'hydrate' }
      })
    }
  },
  post: {
    handler(request, h) {
      const pageContent = content.complianceScheme(request).membersPages.add
      const payload = request.payload || {}
      const { error, value } = schema.validate(payload)

      if (error) {
        const messages = fieldMessages(pageContent.error)
        const errorList = error.details.map((detail) => {
          const field = detail.path[0]
          const text =
            field === 'bprn' && detail.type === 'string.pattern.base'
              ? pageContent.error.bprnFormat
              : messages[field]
          return { text, href: `#${field}` }
        })
        flashStepErrors(request, STEP_ID, errorList, payload)
        return h.redirect(paths.complianceSchemeMembersAdd)
      }

      return renderView(h, request, pageContent, {
        errorSummary: [],
        errors: {},
        formValues: value,
        pagePayload: {
          view: 'add',
          target: 'persist',
          member: { producerBprn: value.bprn, companyName: value.companyName },
          next: paths.complianceSchemeMembers
        }
      })
    }
  }
}

