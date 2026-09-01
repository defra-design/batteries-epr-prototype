import { paths } from '../../../../config/paths.js'
import { prototypeRegistrationContent } from '../../../../config/prototype-registration-content.js'
import { basePageModel } from '../shared.js'

export const startController = {
  handler(_request, h) {
    const pageContent = prototypeRegistrationContent.start

    return h.view('prototype/registration/start/view', {
      ...basePageModel(pageContent),
      breadcrumbs: prototypeRegistrationContent.breadcrumbs,
      startUrl: paths.prototypeRegistrationOneLogin
    })
  }
}
