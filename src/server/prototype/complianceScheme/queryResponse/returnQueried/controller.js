import Boom from '@hapi/boom'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import { formatDateOnly } from '../../../regulator/pomSubmission/shared.js'
import { taskFlowPageModel } from '../../pomSubmission/shared.js'
import { figuresFor, returnFor } from '../shared.js'

const pageContent = prototypeComplianceSchemeContent.queryResponse.returnQueried

// Tag text and colour come from the regulator's own status vocabulary so
// "Queried" is the same word and colour on both sides of the journey.
const regulatorStatus = prototypeRegulatorContent.reviewPomReturn

const regulatorQueried = prototypeRegulatorContent.reviewPomReturnQueried

const figuresPhrase = (count) =>
  `${count} ${count === 1 ? 'figure' : 'figures'}`

export const returnQueriedController = {
  handler(request, h) {
    const { year, quarter } = request.params

    const submission = returnFor(year, quarter)
    if (!submission) {
      throw Boom.notFound()
    }

    const title = pageContent.submissionTitleTemplate.replace(
      '{period}',
      submission.periodLabel
    )
    const isQueried = submission.status === 'queried'
    const figures = figuresFor(submission)
    const outstanding = figures.filter((figure) => figure.status === 'queried')
    const allCorrected = isQueried && outstanding.length === 0

    return h.view(
      'prototype/complianceScheme/queryResponse/returnQueried/view',
      {
        ...taskFlowPageModel({ title, heading: title, ...pageContent }),
        backLink: paths.prototypeComplianceSchemeSubmissionSubmissions,
        submissionsUrl: paths.prototypeComplianceSchemeSubmissionSubmissions,
        isQueried,
        statusLabel: regulatorStatus.statusLabels[submission.status],
        statusColour: regulatorStatus.statusColours[submission.status],
        allCorrected,
        bannerTitle: allCorrected
          ? pageContent.allCorrectedBanner.title
          : pageContent.banner.title,
        bannerBody: (allCorrected
          ? pageContent.allCorrectedBanner.bodyTemplate
          : pageContent.banner.bodyTemplate
        )
          .replace(
            '{figures}',
            figuresPhrase(allCorrected ? figures.length : outstanding.length)
          )
          .replace('{period}', submission.periodLabel),
        notQueriedBody: pageContent.notQueriedBodyTemplate.replace(
          '{period}',
          submission.periodLabel
        ),
        submittedOn: formatDateOnly(submission.submittedOn),
        reviewedOn: formatDateOnly(submission.decidedOn),
        records: figures.map((figure) => ({
          isQueried: figure.status === 'queried',
          statusLabel: regulatorQueried.figureStatusLabels[figure.status],
          statusColour: regulatorQueried.figureStatusColours[figure.status],
          member: figure.member,
          chemistry: figure.chemistry,
          reason: figure.reason,
          reviewHref: pathTo(
            paths.prototypeComplianceSchemeQueryResponseReviewFigure,
            { year, quarter, recordId: figure.id }
          ),
          reviewHidden: pageContent.reviewHiddenTemplate.replace(
            '{member}',
            figure.member
          )
        }))
      }
    )
  }
}
