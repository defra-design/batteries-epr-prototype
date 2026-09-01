import { paths } from '../../../../config/paths.js'
import { prototypeSubmissionContent } from '../../../../config/prototype-submission-content.js'
import { prototypeRegistrationContent } from '../../../../config/prototype-registration-content.js'
import { basePageModel, buildHydrationPayload } from '../shared.js'

const returnHere = (stepPath) =>
  `${stepPath}?return=${encodeURIComponent(paths.prototypeSubmissionCheckRegistration)}`

export const checkRegistrationController = {
  handler(_request, h) {
    const pageContent = prototypeSubmissionContent.checkRegistration

    return h.view('prototype/submission/checkRegistration/view', {
      ...basePageModel(pageContent),
      rowLabels: prototypeRegistrationContent.checkAnswers.rows,
      changeAction: prototypeRegistrationContent.checkAnswers.changeAction,
      backLink: paths.prototypeSubmissionTonnage,
      continueUrl: paths.prototypeSubmissionBrandQuestion,
      changeUrls: {
        batteryTypes: returnHere(paths.prototypeSubmissionBatteryCategory),
        tonnage: returnHere(paths.prototypeSubmissionTonnage),
        organisationType: returnHere(
          paths.prototypeRegistrationOrganisationType
        ),
        appropriatePerson: returnHere(
          paths.prototypeRegistrationAppropriatePerson
        ),
        schemeMembership: returnHere(
          paths.prototypeRegistrationSchemeMembership
        )
      },
      pagePayload: buildHydrationPayload('checkRegistration')
    })
  }
}
