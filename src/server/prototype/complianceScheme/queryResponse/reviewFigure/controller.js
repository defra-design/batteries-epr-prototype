import Boom from '@hapi/boom'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'
import { taskFlowPageModel } from '../../pomSubmission/shared.js'
import { queriedFigureFor, returnFor } from '../shared.js'

const pageContent = prototypeComplianceSchemeContent.queryResponse.reviewFigure

export const reviewFigureController = {
  handler(request, h) {
    const { year, quarter, recordId } = request.params

    const submission = returnFor(year, quarter)
    const figure = submission ? queriedFigureFor(submission, recordId) : null
    if (!figure) {
      throw Boom.notFound()
    }

    const heading = pageContent.headingTemplate
      .replace('{member}', figure.member)
      .replace('{chemistry}', figure.chemistry)

    return h.view(
      'prototype/complianceScheme/queryResponse/reviewFigure/view',
      {
        ...taskFlowPageModel({
          ...pageContent,
          title: heading,
          heading
        }),
        backLink: pathTo(
          paths.prototypeComplianceSchemeQueryResponseReturnQueried,
          { year, quarter }
        ),
        continueHref: pathTo(
          paths.prototypeComplianceSchemeQueryResponseCorrectFigure,
          { year, quarter, recordId }
        ),
        caption: pageContent.captionTemplate.replace(
          '{period}',
          submission.periodLabel
        ),
        figure: {
          member: figure.member,
          chemistry: figure.chemistry,
          originalFigure: pageContent.figureTemplate.replace(
            '{tonnes}',
            figure.figureTonnes.toLocaleString('en-GB')
          ),
          reason: figure.reason
        }
      }
    )
  }
}
