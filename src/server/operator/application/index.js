import { paths } from '../../../config/paths.js'
import { applicationController } from './controller.js'

export const operatorApplication = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.operatorApplication,
      ...applicationController.get
    },
    {
      method: 'POST',
      path: paths.operatorApplication,
      ...applicationController.post
    }
  ]
}
