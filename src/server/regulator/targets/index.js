import { paths } from '../../../config/paths.js'
import { targetsController } from './controller.js'

export const regulatorTargets = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.regulatorTargets,
      ...targetsController.get
    },
    {
      method: 'POST',
      path: paths.regulatorTargets,
      ...targetsController.post
    }
  ]
}
