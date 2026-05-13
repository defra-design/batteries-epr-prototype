import { paths } from '../../../config/paths.js'
import { producerRouteController } from './controller.js'

export const producerRoute = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.onboardingProducerRoute,
      ...producerRouteController.get
    },
    {
      method: 'POST',
      path: paths.onboardingProducerRoute,
      ...producerRouteController.post
    }
  ]
}
