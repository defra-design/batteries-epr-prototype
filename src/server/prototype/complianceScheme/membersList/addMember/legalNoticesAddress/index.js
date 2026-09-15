import { paths } from '../../../../../../config/paths.js'
import { legalNoticesAddressController } from './controller.js'

export const legalNoticesAddress = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeMembersListAddMemberLegalNoticesAddress,
      ...legalNoticesAddressController.get
    },
    {
      method: 'POST',
      path: paths.prototypeMembersListAddMemberLegalNoticesAddress,
      ...legalNoticesAddressController.post
    }
  ]
}
