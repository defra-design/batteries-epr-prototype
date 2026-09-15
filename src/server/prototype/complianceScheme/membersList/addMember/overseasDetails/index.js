import { paths } from '../../../../../../config/paths.js'
import { overseasDetailsController } from './controller.js'

export const overseasDetails = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeMembersListAddMemberOverseasDetails,
      ...overseasDetailsController.get
    },
    {
      method: 'POST',
      path: paths.prototypeMembersListAddMemberOverseasDetails,
      ...overseasDetailsController.post
    }
  ]
}
