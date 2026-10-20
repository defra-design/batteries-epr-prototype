import Boom from '@hapi/boom'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import { basePageModel, SCHEMES_WITH_DETAIL_SCREENS_BUILT } from '../shared.js'

// How long the interstitial waits before moving on by itself.
export const AUTO_ADVANCE_SECONDS = 5

export const runningDataChecksController = {
  handler(request, h) {
    const { schemeId } = request.params

    if (!SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(schemeId)) {
      throw Boom.notFound()
    }

    const labels = prototypeRegulatorContent.runningDataChecks

    return h.view('prototype/regulator/pomSubmission/runningDataChecks/view', {
      ...basePageModel(labels),
      autoAdvanceSeconds: AUTO_ADVANCE_SECONDS,
      nextStep: pathTo(paths.prototypeRegulatorPomSubmissionDataCheckReport, {
        schemeId
      })
    })
  }
}
