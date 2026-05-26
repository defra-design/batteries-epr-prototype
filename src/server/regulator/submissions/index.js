import { paths } from '../../../config/paths.js'
import { submissionsController } from './controller.js'

export const regulatorSubmissions = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.regulatorSubmissions,
      ...submissionsController
    }
  ]
}
