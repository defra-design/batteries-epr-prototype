import { paths } from '../../../../config/paths.js'
import { organisationTypeController } from './controller.js'

export const organisationType = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegistrationOrganisationType,
      ...organisationTypeController.get
    },
    {
      method: 'POST',
      path: paths.prototypeRegistrationOrganisationType,
      ...organisationTypeController.post
    }
  ]
}
