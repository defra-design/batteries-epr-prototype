import { paths } from '../../../config/paths.js'
import { reasonController } from './controller.js'

export const leaveSchemeReason = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.leaveSchemeReason,
      ...reasonController.get
    },
    {
      method: 'POST',
      path: paths.leaveSchemeReason,
      ...reasonController.post
    }
  ]
}
