import { createRequire } from 'node:module'
import Boom from '@hapi/boom'
import { addDays, format, parseISO } from 'date-fns'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import {
  basePageModel,
  SCHEMES_WITH_DETAIL_SCREENS_BUILT,
  findSubmission,
  formatDateOnly
} from '../shared.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

const nextPeriodLabel = (quarter, year) => {
  const n = Number(quarter.replace('Q', ''))
  return n === 4 ? `Q1 ${Number(year) + 1}` : `Q${n + 1} ${year}`
}

export const reviewPomReturnRejectedController = {
  handler(request, h) {
    const { schemeId, year, quarter } = request.params

    if (!SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(schemeId)) {
      throw Boom.notFound()
    }

    const submission = findSubmission(schemeId, year, quarter)
    if (!submission) {
      throw Boom.notFound()
    }

    if (submission.status !== 'rejected') {
      return h.redirect(
        pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, {
          schemeId,
          year,
          quarter
        })
      )
    }

    const pageContent = prototypeRegulatorContent.reviewPomReturnRejected
    const scheme = seedData.prototypeRegulatorSchemes.find(
      (s) => s.id === schemeId
    )
    const resubmitBy = formatDateOnly(
      addDays(parseISO(submission.decidedOn), 28).toISOString()
    )
    const reasonLine = pageContent.reasonTemplate
      .replace(
        '{errorType}',
        pageContent.errorTypeLabels[submission.rejectionType] ??
          submission.rejectionType
      )
      .replace('{reason}', submission.reason ?? '')

    return h.view(
      'prototype/regulator/pomSubmission/reviewPomReturnRejected/view',
      {
        ...basePageModel(
          {
            ...pageContent,
            heading: `${scheme.name} — ${submission.periodLabel} return`
          },
          paths.prototypeRegulatorPomSubmissionDashboard
        ),
        backLink: pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, {
          schemeId,
          year,
          quarter
        }),
        scheme,
        submission,
        statusLabel:
          prototypeRegulatorContent.reviewPomReturn.statusLabels.rejected,
        statusColour:
          prototypeRegulatorContent.reviewPomReturn.statusColours.rejected,
        bannerBody: pageContent.bannerBodyTemplate
          .replace('{period}', submission.periodLabel)
          .replace('{scheme}', scheme.name)
          .replace('{resubmitBy}', resubmitBy),
        intro: pageContent.introTemplate.replace(
          '{nextPeriod}',
          nextPeriodLabel(quarter, year)
        ),
        reasonLine,
        resubmitByLine: pageContent.resubmitByTemplate.replace(
          '{resubmitBy}',
          resubmitBy
        ),
        decidedByLine: submission.decidedBy,
        decidedOnLine: format(
          parseISO(submission.decidedOn),
          'd MMMM yyyy, HH:mm'
        ),
        filesLinkText: pageContent.links.files.replace(
          '{count}',
          submission.filesCount ?? 0
        ),
        dashboardHref: `${paths.prototypeRegulatorPomSubmissionDashboard}#pom-submissions`
      }
    )
  }
}
