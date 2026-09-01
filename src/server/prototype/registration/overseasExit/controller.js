import { paths } from '../../../../config/paths.js'
import { prototypeRegistrationContent } from '../../../../config/prototype-registration-content.js'
import { basePageModel } from '../shared.js'

export const overseasExitController = {
  handler(_request, h) {
    const pageContent = prototypeRegistrationContent.overseasExit

    return h.view('prototype/registration/overseasExit/view', {
      ...basePageModel(pageContent),
      breadcrumbs: prototypeRegistrationContent.breadcrumbs,
      changeAnswerUrl: paths.prototypeRegistrationOrganisationType,
      backLink: paths.prototypeRegistrationOverseasDetails
    })
  }
}
