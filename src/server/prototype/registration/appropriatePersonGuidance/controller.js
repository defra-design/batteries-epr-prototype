import { paths } from '../../../../config/paths.js'
import { prototypeRegistrationContent } from '../../../../config/prototype-registration-content.js'
import { basePageModel } from '../shared.js'

export const appropriatePersonGuidanceController = {
  handler(_request, h) {
    const pageContent = prototypeRegistrationContent.appropriatePersonGuidance

    return h.view('prototype/registration/appropriatePersonGuidance/view', {
      ...basePageModel(pageContent),
      continueUrl: paths.prototypeRegistrationAppropriatePerson,
      backLink: paths.prototypeRegistrationOrganisationType
    })
  }
}
