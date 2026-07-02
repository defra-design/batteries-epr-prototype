import { paths } from '../../config/paths.js'
import { passwordController } from './controller.js'

export const password = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.password,
      ...passwordController.get
    },
    {
      method: 'POST',
      path: paths.password,
      ...passwordController.post
    }
  ]
}
