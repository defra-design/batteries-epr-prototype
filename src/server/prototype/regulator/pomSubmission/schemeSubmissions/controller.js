import { createRequire } from 'node:module'
import Boom from '@hapi/boom'
import { format, parseISO } from 'date-fns'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import {
  basePageModel,
  SCHEMES_WITH_DETAIL_SCREENS_BUILT,
  submissionsFor
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

const decidedText = (pageContent, submission) => {
  if (!submission.decidedOn) {
    return pageContent.awaitingDecision
  }
  const date = format(parseISO(submission.decidedOn), 'd MMMM yyyy')
  return `${date}, ${submission.decidedBy}`
}

const groupByYear = (pageContent, submissions) => {
  const years = [...new Set(submissions.map((s) => s.compliancePeriodYear))]
    .sort()
    .reverse()

  return years.map((year) => ({
    year,
    submissions: submissions
      .filter((s) => s.compliancePeriodYear === year)
      .sort((a, b) => b.submittedOn.localeCompare(a.submittedOn))
      .map((submission) => ({
        periodLabel: submission.periodLabel,
        submittedOn: submission.submittedOn,
        filesCount: submission.filesCount,
        statusLabel: pageContent.statusLabels[submission.status],
        statusColour: STATUS_TAG_COLOUR[submission.status],
        decided: decidedText(pageContent, submission)
      }))
  }))
}

export const schemeSubmissionsController = {
  handler(request, h) {
    const { schemeId } = request.params

    if (!SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(schemeId)) {
      throw Boom.notFound()
    }

    const pageContent = prototypeRegulatorContent.schemeSubmissions
    const scheme = seedData.prototypeRegulatorSchemes.find(
      (s) => s.id === schemeId
    )

    const submissions = submissionsFor(schemeId)

    return h.view('prototype/regulator/pomSubmission/schemeSubmissions/view', {
      ...basePageModel(
        pageContent,
        paths.prototypeRegulatorPomSubmissionDashboard
      ),
      backLink: pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, {
        schemeId
      }),
      scheme,
      years: groupByYear(pageContent, submissions)
    })
  }
}
