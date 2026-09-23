import { createRequire } from 'node:module'
import Boom from '@hapi/boom'
import { format, parseISO } from 'date-fns'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import {
  basePageModel,
  SCHEMES_WITH_HOME_BUILT,
  SCHEMES_WITH_DETAIL_SCREENS_BUILT,
  latestSubmissionFor
} from '../shared.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

const STATUS_TAG_COLOUR = {
  received: 'blue',
  accepted: 'green',
  queried: 'orange',
  rejected: 'red',
  notYetSubmitted: 'grey'
}

const formatDateOnly = (isoString) =>
  /* v8 ignore next */
  isoString ? format(parseISO(isoString), 'd MMMM yyyy') : null

const submissionIntro = (scheme, submission) => {
  const period = submission.periodLabel
  switch (submission.status) {
    case 'received':
      return `${scheme.name}'s ${period} return has been received. It arrived as ${submission.filesCount} CSV files, each already checked by the scheme on upload. Run the Agency's data checks before reviewing the figures.`
    case 'accepted':
      return `${scheme.name}'s ${period} return was accepted on ${formatDateOnly(submission.decidedOn)}.`
    case 'rejected':
      return `${scheme.name}'s ${period} return was rejected on ${formatDateOnly(submission.decidedOn)}.`
    case 'queried':
      return `${scheme.name}'s ${period} return has ${submission.issuesFound} record(s) queried and awaiting a response.`
    /* v8 ignore next 2 */
    default:
      return `${scheme.name} has not yet submitted a return for ${period}.`
  }
}

const buildQuickLinks = (pageContent, schemeId) => {
  const detailScreensBuilt = SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(schemeId)
  return {
    record: {
      text: pageContent.quickLinks.record,
      href: detailScreensBuilt
        ? pathTo(paths.prototypeRegulatorPomSubmissionSchemeRecord, {
            schemeId
          })
        : '#'
    },
    members: {
      text: pageContent.quickLinks.members,
      href: detailScreensBuilt
        ? pathTo(paths.prototypeRegulatorPomSubmissionSchemeMembers, {
            schemeId
          })
        : '#'
    },
    submissions: {
      text: pageContent.quickLinks.submissions,
      href: detailScreensBuilt
        ? pathTo(paths.prototypeRegulatorPomSubmissionSchemeSubmissions, {
            schemeId
          })
        : '#'
    }
  }
}

export const schemeHomeController = {
  handler(request, h) {
    const { schemeId } = request.params

    if (!SCHEMES_WITH_HOME_BUILT.has(schemeId)) {
      throw Boom.notFound()
    }

    const pageContent = prototypeRegulatorContent.schemeHome
    const scheme = seedData.prototypeRegulatorSchemes.find(
      (s) => s.id === schemeId
    )
    const currentSubmission = latestSubmissionFor(schemeId)
    const membersCount = currentSubmission.membersCount

    return h.view('prototype/regulator/pomSubmission/schemeHome/view', {
      ...basePageModel(
        { ...pageContent, title: scheme.name, heading: scheme.name },
        paths.prototypeRegulatorPomSubmissionDashboard
      ),
      backLink: paths.prototypeRegulatorPomSubmissionDashboard,
      scheme,
      membersCount,
      quickLinks: buildQuickLinks(pageContent, schemeId),
      submission: currentSubmission,
      submissionHeading: `${currentSubmission.periodLabel} submission`,
      submissionIntro: submissionIntro(scheme, currentSubmission),
      submissionStatusLabel: pageContent.statusLabels[currentSubmission.status],
      submissionStatusColour: STATUS_TAG_COLOUR[currentSubmission.status],
      showRunDataChecks: currentSubmission.status === 'received',
      runDataChecksHref: pathTo(
        paths.prototypeRegulatorPomSubmissionRunningDataChecks,
        { schemeId }
      ),
      filesHref: SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(schemeId)
        ? pathTo(paths.prototypeRegulatorPomSubmissionSubmissionFiles, {
            schemeId,
            year: currentSubmission.compliancePeriodYear,
            quarter: currentSubmission.quarter
          })
        : '#'
    })
  }
}
