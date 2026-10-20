import joi from 'joi'
import { paths } from '../../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../../config/prototype-compliance-scheme-content.js'
import { taskFlowPageModel } from '../../shared.js'
import { listSelectableMembers } from './members.js'

const VIEW =
  'prototype/complianceScheme/pomSubmission/singleMember/details/view'

const pathFor = (path, { year, quarter }) =>
  path.replace('{year}', year).replace('{quarter}', quarter)

const buildSchema = (members) =>
  joi
    .object({
      memberId: joi
        .string()
        .valid(...members.map((member) => member.id))
        .required()
    })
    .options({ stripUnknown: true })

const buildViewModel = (
  request,
  pageContent,
  members,
  { errorSummary = [], errors = {}, formValues = {}, pagePayload = null } = {}
) => {
  const { year, quarter } = request.params
  const selected = members.find((member) => member.id === formValues.memberId)

  return {
    ...taskFlowPageModel(pageContent),
    caption: `${year} ${pageContent.complianceCaption}`,
    backLink: pathFor(
      paths.prototypeComplianceSchemeSubmissionReportingMethod,
      {
        year,
        quarter
      }
    ),
    action: pathFor(
      paths.prototypeComplianceSchemeSubmissionSingleMemberDetails,
      { year, quarter }
    ),
    errorTitle: pageContent.error.title,
    errorSummary,
    errors,
    memberItems: [
      { value: '', text: pageContent.memberPlaceholder },
      ...members.map((member) => ({
        value: member.id,
        text: member.name,
        selected: member.id === formValues.memberId
      }))
    ],
    bprn: selected?.bprn ?? '',
    schemeRef: selected?.schemeRef ?? members[0].schemeRef,
    pagePayload: pagePayload ?? {
      target: 'hydrate',
      step: 'singleMemberDetails',
      year,
      quarter,
      members
    }
  }
}

export const singleMemberDetailsController = {
  get: {
    handler(request, h) {
      const pageContent = prototypeComplianceSchemeContent.singleMemberDetails
      return h.view(
        VIEW,
        buildViewModel(request, pageContent, listSelectableMembers())
      )
    }
  },

  post: {
    options: {
      validate: {
        payload: (value, options) =>
          buildSchema(listSelectableMembers()).validateAsync(value, options),
        failAction: (request, h, _err) => {
          const pageContent =
            prototypeComplianceSchemeContent.singleMemberDetails
          const message = pageContent.error.member
          return h
            .view(
              VIEW,
              buildViewModel(request, pageContent, listSelectableMembers(), {
                errorSummary: [{ text: message, href: '#memberId' }],
                errors: { memberId: message },
                formValues: request.payload ?? {}
              })
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const { year, quarter } = request.params
      const pageContent = prototypeComplianceSchemeContent.singleMemberDetails
      const members = listSelectableMembers()
      const member = members.find((m) => m.id === request.payload.memberId)

      return h.view(
        VIEW,
        buildViewModel(request, pageContent, members, {
          formValues: request.payload,
          pagePayload: {
            target: 'save',
            year,
            quarter,
            savedFields: {
              memberId: member.id,
              memberName: member.name,
              bprn: member.bprn,
              schemeRef: member.schemeRef
            },
            nextStep: pathFor(
              paths.prototypeComplianceSchemeSubmissionSingleMemberChemistries,
              { year, quarter }
            )
          }
        })
      )
    }
  }
}
