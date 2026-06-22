import { paths } from '../../../../config/paths.js'
import { producerRouteController } from './controller.js'

export const producerRoute = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.niOnboardingProducerRoute,
      ...producerRouteController.get
    },
    {
      method: 'POST',
      path: paths.niOnboardingProducerRoute,
      ...producerRouteController.post
    }
  ]
}
