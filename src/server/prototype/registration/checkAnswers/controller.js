import { paths } from '../../../../config/paths.js'
import { prototypeRegistrationContent } from '../../../../config/prototype-registration-content.js'
import { basePageModel, buildHydrationPayload } from '../shared.js'

const STEP_ID = 'checkAnswers'

const changeUrl = (stepPath) =>
  `${stepPath}?return=${encodeURIComponent(paths.prototypeRegistrationCheckAnswers)}`

export const checkAnswersController = {
  handler(_request, h) {
    const pageContent = prototypeRegistrationContent.checkAnswers

    return h.view('prototype/registration/checkAnswers/view', {
      ...basePageModel(pageContent),
      backLink: paths.prototypeRegistrationSchemeMembership,
      continueUrl: paths.prototypeRegistrationDeclaration,
      changeUrls: {
        batteryTypes: changeUrl(paths.prototypeRegistrationBatteryCategory),
        tonnage: changeUrl(paths.prototypeRegistrationTonnage),
        organisationType: changeUrl(
          paths.prototypeRegistrationOrganisationType
        ),
        appropriatePerson: changeUrl(
          paths.prototypeRegistrationAppropriatePerson
        ),
        schemeMembership: changeUrl(paths.prototypeRegistrationSchemeMembership)
      },
      pagePayload: buildHydrationPayload(STEP_ID)
    })
  }
}
