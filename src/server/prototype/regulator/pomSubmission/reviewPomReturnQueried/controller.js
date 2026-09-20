import { createRequire } from 'node:module'
import Boom from '@hapi/boom'
import { addDays, parseISO } from 'date-fns'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import { getMemberFigures } from '../store.js'
import {
  basePageModel,
  SCHEMES_WITH_DETAIL_SCREENS_BUILT,
  findSubmission,
  relatedLinksFor,
  formatDateOnly,
  filenameFor
} from '../shared.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

const queriedFilenameFor = (scheme, submission) =>
  filenameFor(scheme, submission).replace(/\.csv$/, '_queried.csv')

export const reviewPomReturnQueriedController = {
  handler(request, h) {
    const { schemeId, year, quarter } = request.params

    if (!SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(schemeId)) {
      throw Boom.notFound()
    }

    const submission = findSubmission(schemeId, year, quarter)
    if (!submission) {
      throw Boom.notFound()
    }

    if (submission.status !== 'queried') {
      return h.redirect(
        pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, {
          schemeId,
          year,
          quarter
        })
      )
    }

    const pageContent = prototypeRegulatorContent.reviewPomReturnQueried
    const scheme = seedData.prototypeRegulatorSchemes.find(
      (s) => s.id === schemeId
    )

    // Queried records plus any the scheme has since corrected: both were
    // queried, so the count and the list stay the same as the scheme answers.
    const queriedFigures = getMemberFigures()
      .filter(
        (f) =>
          f.schemeId === schemeId &&
          ['queried', 'resubmitted'].includes(f.status)
      )
      .map((f) => ({
        ...f,
        figureTonnes: f.amendedTonnes ?? f.figureTonnes,
        statusLabel: pageContent.figureStatusLabels[f.status],
        statusColour: pageContent.figureStatusColours[f.status]
      }))
    const count = queriedFigures.length

    const respondBy = formatDateOnly(
      addDays(parseISO(submission.decidedOn), 28).toISOString()
    )

    return h.view(
      'prototype/regulator/pomSubmission/reviewPomReturnQueried/view',
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
        bannerHeading: pageContent.bannerHeadingTemplate.replace(
          '{count}',
          count
        ),
        bannerBody: pageContent.bannerBodyTemplate
          .replace('{scheme}', scheme.name)
          .replace('{period}', submission.periodLabel),
        intro: pageContent.introTemplate
          .replace('{scheme}', scheme.name)
          .replace('{period}', submission.periodLabel)
          .replace('{submittedOn}', formatDateOnly(submission.submittedOn))
          .replace('{count}', count)
          .replace('{decidedOn}', formatDateOnly(submission.decidedOn)),
        decisionLine: pageContent.decisionTemplate
          .replace('{count}', count)
          .replace('{total}', submission.recordsCount.toLocaleString('en-GB')),
        decidedByLine: submission.decidedBy,
        decidedOnLine: formatDateOnly(submission.decidedOn),
        schemeNotifiedLine: pageContent.schemeNotifiedTemplate.replace(
          '{decidedOn}',
          formatDateOnly(submission.decidedOn)
        ),
        respondByLine: pageContent.respondByTemplate.replace(
          '{respondBy}',
          respondBy
        ),
        restOfReturnValue: pageContent.restOfReturnValue,
        yourReasonLine: submission.reason ?? null,
        queriedFigures,
        downloadQueriedFilename: queriedFilenameFor(scheme, submission),
        whatSchemeSeesHeading: pageContent.whatSchemeSeesHeading.replace(
          '{scheme}',
          scheme.name
        ),
        relatedLinks: relatedLinksFor(
          prototypeRegulatorContent.reviewPomReturn,
          schemeId
        ).slice(0, 3)
      }
    )
  }
}
