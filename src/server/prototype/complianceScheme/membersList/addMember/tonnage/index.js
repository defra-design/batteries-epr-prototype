import { paths } from '../../../../../../config/paths.js'
import { tonnageController } from './controller.js'

export const tonnage = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeMembersListAddMemberTonnage,
      ...tonnageController.get
    },
    {
      method: 'POST',
      path: paths.prototypeMembersListAddMemberTonnage,
      ...tonnageController.post
    }
  ]
}
