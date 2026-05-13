import { paths } from '../../../config/paths.js'
import { serviceOfNoticeController } from './controller.js'

export const serviceOfNotice = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.onboardingServiceOfNotice,
      ...serviceOfNoticeController.get
    },
    {
      method: 'POST',
      path: paths.onboardingServiceOfNotice,
      ...serviceOfNoticeController.post
    }
  ]
}
