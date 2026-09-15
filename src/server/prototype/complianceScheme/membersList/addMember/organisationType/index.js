import { paths } from '../../../../../../config/paths.js'
import { organisationTypeController } from './controller.js'

export const organisationType = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeMembersListAddMemberOrganisationType,
      ...organisationTypeController.get
    },
    {
      method: 'POST',
      path: paths.prototypeMembersListAddMemberOrganisationType,
      ...organisationTypeController.post
    }
  ]
}
