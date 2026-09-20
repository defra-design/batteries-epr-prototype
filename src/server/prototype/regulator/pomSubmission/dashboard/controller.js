import { createRequire } from 'node:module'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import { basePageModel, SCHEMES_WITH_HOME_BUILT } from '../shared.js'
import { getSubmissions } from '../store.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

const REGISTRATION_STATUS_TAG_COLOUR = {
  submitted: 'blue',
  paymentIssue: 'orange',
  notSubmitted: 'grey'
}

const POM_STATUS_TAG_COLOUR = {
  received: 'blue',
  accepted: 'green',
  queried: 'orange',
  notYetSubmitted: 'grey'
}

const schemeHomeHref = (schemeId) =>
  SCHEMES_WITH_HOME_BUILT.has(schemeId)
    ? pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, { schemeId })
    : '#'

const buildRegistrationCases = (pageContent) =>
  seedData.prototypeRegulatorRegistrationCases.map((registrationCase) => ({
    producerName: registrationCase.producerName,
    scheme: registrationCase.scheme,
    type: registrationCase.type,
    statusLabel: pageContent.statusLabels[registrationCase.status],
    statusColour: REGISTRATION_STATUS_TAG_COLOUR[registrationCase.status],
    dueOn: registrationCase.dueOn,
    previousYears: registrationCase.previousYears
  }))

const buildPomSubmissions = (pageContent) => {
  const schemesById = new Map(
    seedData.prototypeRegulatorSchemes.map((scheme) => [scheme.id, scheme])
  )

  return getSubmissions().map((submission) => ({
    schemeId: submission.schemeId,
    schemeName:
      schemesById.get(submission.schemeId)?.name ?? submission.schemeId,
    membersCount: submission.membersCount,
    submittedOn: submission.submittedOn,
    statusLabel: pageContent.statusLabels[submission.status],
    statusColour: POM_STATUS_TAG_COLOUR[submission.status],
    issuesFound: submission.issuesFound,
    viewHref: schemeHomeHref(submission.schemeId)
  }))
}

export const dashboardController = {
  handler(_request, h) {
    const pageContent = prototypeRegulatorContent.dashboard

    return h.view('prototype/regulator/pomSubmission/dashboard/view', {
      ...basePageModel(
        pageContent,
        paths.prototypeRegulatorPomSubmissionDashboard
      ),
      registrationsTab: pageContent.registrationsTab,
      registrationCases: buildRegistrationCases(pageContent.registrationsTab),
      pomSubmissionsTab: pageContent.pomSubmissionsTab,
      pomSubmissions: buildPomSubmissions(pageContent.pomSubmissionsTab)
    })
  }
}
