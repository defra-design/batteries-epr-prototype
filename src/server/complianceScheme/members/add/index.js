import { paths } from '../../../../config/paths.js'
import { addController } from './controller.js'

export const membersAdd = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.complianceSchemeMembersAdd,
      ...addController.get
    },
    {
      method: 'POST',
      path: paths.complianceSchemeMembersAdd,
      ...addController.post
    }
  ]
}
