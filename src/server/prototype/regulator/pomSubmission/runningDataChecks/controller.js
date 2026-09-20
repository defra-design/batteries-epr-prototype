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

export const runningDataChecksController = {
  handler(request, h) {
    const { schemeId } = request.params

    if (!SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(schemeId)) {
      throw Boom.notFound()
    }

    const pageContent = prototypeRegulatorContent.runningDataChecks
    const scheme = seedData.prototypeRegulatorSchemes.find(
      (s) => s.id === schemeId
    )
    const submission = latestSubmissionFor(schemeId)
    const nextStep = pathTo(
      paths.prototypeRegulatorPomSubmissionDataCheckReport,
      { schemeId }
    )

    return h.view('prototype/regulator/pomSubmission/runningDataChecks/view', {
      ...basePageModel(
        pageContent,
        paths.prototypeRegulatorPomSubmissionDashboard
      ),
      backLink: pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, {
        schemeId
      }),
      body1: `Checking ${filenameFor(scheme, submission)} against the CSV template, and comparing figures against previous quarters.`,
      nextStep
    })
  }
}
