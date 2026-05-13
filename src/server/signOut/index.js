import { paths } from '../../config/paths.js'
import { signOutController } from './controller.js'

export const signOut = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.signOut,
      ...signOutController
    }
  ]
}
