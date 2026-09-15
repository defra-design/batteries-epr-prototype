import { paths } from '../../../../../../config/paths.js'
import { soleTraderDetailsController } from './controller.js'

export const soleTraderDetails = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeMembersListAddMemberSoleTraderDetails,
      ...soleTraderDetailsController.get
    },
    {
      method: 'POST',
      path: paths.prototypeMembersListAddMemberSoleTraderDetails,
      ...soleTraderDetailsController.post
    }
  ]
}
