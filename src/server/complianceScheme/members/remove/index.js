import { paths } from '../../../../config/paths.js'
import { removeController } from './controller.js'

export const membersRemove = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.complianceSchemeMemberRemove,
      ...removeController.get
    },
    {
      method: 'POST',
      path: paths.complianceSchemeMemberRemove,
      ...removeController.post
    }
  ]
}
