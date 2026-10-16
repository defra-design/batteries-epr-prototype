import { paths } from '../../../../../config/paths.js'
import { emailController } from './controller.js'

export const email = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeAbtoThresholdEmail,
      ...emailController
    }
  ]
}
