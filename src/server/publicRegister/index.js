import { paths } from '../../config/paths.js'
import {
  publicRegisterSearchController,
  publicRegisterDetailController
} from './controller.js'

export const publicRegister = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.publicRegisterSearch,
      ...publicRegisterSearchController
    },
    {
      method: 'GET',
      path: paths.publicRegisterDetail,
      ...publicRegisterDetailController
    }
  ]
}
