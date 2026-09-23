import { createRequire } from 'node:module'
import Boom from '@hapi/boom'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import {
  basePageModel,
  SCHEMES_WITH_DETAIL_SCREENS_BUILT,
  findSubmission,
  buildLockInfo,
  relatedLinksFor,
  formatDateOnly
} from '../shared.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

export const reviewPomReturnAcceptedController = {
  handler(request, h) {
    const { schemeId, year, quarter } = request.params

    if (!SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(schemeId)) {
      throw Boom.notFound()
    }

    const submission = findSubmission(schemeId, year, quarter)
    if (!submission) {
      throw Boom.notFound()
    }

    // This banner only makes sense once the return has actually been
    // accepted — send the regulator back to the review screen otherwise
    // (e.g. reached by editing the URL, or after a later decision change).
    if (submission.status !== 'accepted') {
      return h.redirect(
        pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, {
          schemeId,
          year,
          quarter
        })
      )
    }

    const pageContent = prototypeRegulatorContent.reviewPomReturnAccepted
    const scheme = seedData.prototypeRegulatorSchemes.find(
      (s) => s.id === schemeId
    )
    const membersTotalCount = seedData.prototypeRegulatorSchemeMembers.filter(
      (m) => m.schemeId === schemeId
    ).length
    const { lockTagText, lockWarning } = buildLockInfo(submission)

    return h.view(
      'prototype/regulator/pomSubmission/reviewPomReturnAccepted/view',
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
          prototypeRegulatorContent.reviewPomReturn.statusLabels.accepted,
        statusColour:
          prototypeRegulatorContent.reviewPomReturn.statusColours.accepted,
        bannerBody: pageContent.bannerBodyTemplate
          .replace('{scheme}', scheme.name)
          .replace('{decidedOn}', formatDateOnly(submission.decidedOn)),
        intro: pageContent.introTemplate
          .replace('{scheme}', scheme.name)
          .replace('{period}', submission.periodLabel)
          .replace('{submittedOn}', formatDateOnly(submission.submittedOn))
          .replace('{decidedOn}', formatDateOnly(submission.decidedOn)),
        lockTagText,
        lockWarning,
        totalPlacedOnMarketLine: `${submission.totalPlacedOnMarketTonnes.toLocaleString('en-GB')} tonnes`,
        membersIncludedLine: `${submission.membersCount} of ${membersTotalCount}`,
        swingCategoriesText: submission.swingCategories.join(', '),
        submittedByLine: `${scheme.superUser.name}, ${scheme.superUser.email}`,
        yourReasonLine: submission.reason,
        relatedLinks: relatedLinksFor(
          prototypeRegulatorContent.reviewPomReturn,
          schemeId
        ).slice(0, 3)
      }
    )
  }
}
