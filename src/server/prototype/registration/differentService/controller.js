import { paths } from '../../../../config/paths.js'
import { prototypeRegistrationContent } from '../../../../config/prototype-registration-content.js'
import { basePageModel } from '../shared.js'

export const differentServiceController = {
  handler(_request, h) {
    const pageContent = prototypeRegistrationContent.differentService

    return h.view('prototype/registration/differentService/view', {
      ...basePageModel(pageContent),
      breadcrumbs: prototypeRegistrationContent.breadcrumbs,
      backLink: paths.prototypeRegistrationBatteryCategory
    })
  }
}
