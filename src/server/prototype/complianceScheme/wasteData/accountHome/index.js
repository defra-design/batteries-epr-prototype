import { paths } from '../../../../../config/paths.js'
import { accountHomeController } from './controller.js'

export const accountHome = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeWasteDataAccountHome,
      ...accountHomeController
    }
  ]
}
