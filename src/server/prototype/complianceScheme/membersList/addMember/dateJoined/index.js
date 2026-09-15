import { paths } from '../../../../../../config/paths.js'
import { dateJoinedController } from './controller.js'

export const dateJoined = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeMembersListAddMemberDateJoined,
      ...dateJoinedController.get
    },
    {
      method: 'POST',
      path: paths.prototypeMembersListAddMemberDateJoined,
      ...dateJoinedController.post
    }
  ]
}
