import { paths } from '../../../../../config/paths.js'
import { prototypeRegulatorRegistrationsContent } from '../../../../../config/prototype-regulator-registrations-content.js'
import { basePageModel } from '../shared.js'
import {
  applicationBreadcrumbs,
  applicationPath,
  findApplication,
  fill,
  summaryRows
} from '../applicationShared.js'
import {
  recordDecision,
  toErrorSummary,
  validateDecision
} from '../applicationDecision.js'

const content = () => prototypeRegulatorRegistrationsContent.review
const view = 'prototype/regulator/registrations/applicationReview/view'

const buildViewModel = (
  applicationId,
  { errors = {}, formValues = {} } = {}
) => {
  const labels = content()
  const found = findApplication(applicationId)
  const { organisation, signatory, superUser } = found
  const values = {
    schemeName: found.schemeName,
    submittedOn: found.submittedOn
  }

  return {
    ...basePageModel(
      {
        title: `${labels.title} — ${found.schemeName}`,
        heading: found.schemeName,
        intro: fill(labels.intro, values)
      },
      { currentNav: 'registrations' }
    ),
    breadcrumbs: applicationBreadcrumbs(found.schemeName),
    labels,
    statusTag: labels.statusTag,
    organisationRows: summaryRows([
      [labels.organisationRows.operatorType, organisation.operatorType],
      [labels.organisationRows.name, found.schemeName],
      [
        labels.organisationRows.companiesHouseNumber,
        organisation.companiesHouseNumber
      ],
      [
        labels.organisationRows.address,
        `${organisation.address}, ${organisation.town}`
      ],
      [labels.organisationRows.postcode, organisation.postcode],
      [labels.organisationRows.telephone, organisation.telephone],
      [labels.organisationRows.email, organisation.email]
    ]),
    signatoryRows: summaryRows([
      [labels.signatoryRows.name, signatory.name],
      [labels.signatoryRows.position, signatory.position],
      [labels.signatoryRows.email, signatory.email]
    ]),
    superUserRows: summaryRows([
      [labels.superUserRows.name, superUser.name],
      [labels.superUserRows.jobTitle, superUser.jobTitle],
      [labels.superUserRows.telephone, superUser.telephone],
      [labels.superUserRows.email, superUser.email]
    ]),
    errors,
    formValues,
    errorSummary: toErrorSummary(errors),
    action: applicationPath(paths.prototypeRegulatorApplicationReview, {
      applicationId
    })
  }
}

export const applicationReviewController = {
  get: {
    handler(request, h) {
      return h.view(view, buildViewModel(request.params.applicationId))
    }
  },

  post: {
    handler(request, h) {
      const { applicationId } = request.params
      findApplication(applicationId)
      const decision = validateDecision(request.payload ?? {}, {
        errors: content().errors,
        confirm: true
      })

      if (Object.keys(decision.errors).length > 0) {
        return h.view(
          view,
          buildViewModel(applicationId, {
            errors: decision.errors,
            formValues: decision.formValues
          })
        )
      }
      return recordDecision(applicationId, decision, h)
    }
  }
}
