import Boom from '@hapi/boom'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import { formatDateOnly } from '../../../regulator/pomSubmission/shared.js'
import { taskFlowPageModel } from '../../pomSubmission/shared.js'
import {
  queriedFiguresFor,
  resubmittedFigureFor,
  returnFor
} from '../shared.js'

const pageContent = prototypeComplianceSchemeContent.queryResponse.figureResent
const returnContent =
  prototypeComplianceSchemeContent.queryResponse.returnQueried
const regulatorQueried = prototypeRegulatorContent.reviewPomReturnQueried

export const figureResentController = {
  handler(request, h) {
    const { year, quarter, recordId } = request.params

    const submission = returnFor(year, quarter)
    const figure = submission
      ? resubmittedFigureFor(submission, recordId)
      : null
    if (!figure) {
      throw Boom.notFound()
    }

    const outstanding = queriedFiguresFor(submission).length
    const title = returnContent.submissionTitleTemplate.replace(
      '{period}',
      submission.periodLabel
    )
    const status =
      outstanding === 0
        ? pageContent.awaitingReview
        : {
            label: regulatorQueried.figureStatusLabels.queried,
            colour: regulatorQueried.figureStatusColours.queried
          }

    return h.view(
      'prototype/complianceScheme/queryResponse/figureResent/view',
      {
        ...taskFlowPageModel({ ...pageContent, title, heading: title }),
        backLink: pathTo(
          paths.prototypeComplianceSchemeQueryResponseReturnQueried,
          { year, quarter }
        ),
        returnUrl: pathTo(
          paths.prototypeComplianceSchemeQueryResponseReturnQueried,
          { year, quarter }
        ),
        submissionsUrl: paths.prototypeComplianceSchemeSubmissionSubmissions,
        bannerBody: pageContent.banner.bodyTemplate
          .replace('{member}', figure.member)
          .replace('{chemistry}', figure.chemistry),
        statusLabel: status.label,
        statusColour: status.colour,
        outstanding,
        outstandingText: pageContent.outstandingTemplate.replace(
          '{figures}',
          `${outstanding} ${outstanding === 1 ? 'figure' : 'figures'}`
        ),
        submittedOn: formatDateOnly(submission.submittedOn),
        reviewedOn: formatDateOnly(submission.decidedOn),
        correctionSentOn: formatDateOnly(figure.resubmittedOn)
      }
    )
  }
}
