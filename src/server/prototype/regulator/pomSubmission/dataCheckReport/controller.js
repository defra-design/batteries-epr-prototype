import { createRequire } from 'node:module'
import Boom from '@hapi/boom'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import {
  basePageModel,
  SCHEMES_WITH_DETAIL_SCREENS_BUILT,
  latestSubmissionFor,
  filenameFor
} from '../shared.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

export const dataCheckReportController = {
  handler(request, h) {
    const { schemeId } = request.params

    if (!SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(schemeId)) {
      throw Boom.notFound()
    }

    const pageContent = prototypeRegulatorContent.dataCheckReport
    const scheme = seedData.prototypeRegulatorSchemes.find(
      (s) => s.id === schemeId
    )
    const submission = latestSubmissionFor(schemeId)

    const findings = seedData.prototypeRegulatorDataCheckFindings
      .filter((f) => f.schemeId === schemeId)
      .map((finding) => ({
        member: finding.member,
        issue: finding.issue,
        typeLabel: pageContent.typeLabels[finding.type],
        typeColour: pageContent.typeColours[finding.type]
      }))

    return h.view('prototype/regulator/pomSubmission/dataCheckReport/view', {
      ...basePageModel(
        pageContent,
        paths.prototypeRegulatorPomSubmissionDashboard
      ),
      backLink: pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, {
        schemeId
      }),
      intro: `${submission.issuesFound} issues found in ${filenameFor(scheme, submission)}. Review the automated findings below, add any observations of your own, then decide how to proceed.`,
      findings,
      continueHref: pathTo(
        paths.prototypeRegulatorPomSubmissionBatterySalesDataSubmission,
        { schemeId }
      )
    })
  }
}
