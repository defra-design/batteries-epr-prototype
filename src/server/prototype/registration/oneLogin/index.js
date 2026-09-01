import { paths } from '../../../../config/paths.js'
import { oneLoginController } from './controller.js'

export const oneLogin = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegistrationOneLogin,
      ...oneLoginController
    }
  ]
}
