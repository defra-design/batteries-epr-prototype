import { paths } from '../../../../config/paths.js'
import { prototypeRegistrationContent } from '../../../../config/prototype-registration-content.js'
import { basePageModel, buildHydrationPayload } from '../shared.js'

const STEP_ID = 'complete'

export const completeController = {
  handler(_request, h) {
    const pageContent = prototypeRegistrationContent.complete

    return h.view('prototype/registration/complete/view', {
      ...basePageModel(pageContent),
      heading: pageContent.bprnPanelTitle,
      returnUrl: paths.prototype,
      pagePayload: buildHydrationPayload(STEP_ID)
    })
  }
}
