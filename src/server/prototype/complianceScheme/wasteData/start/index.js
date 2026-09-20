import { paths } from '../../../../../config/paths.js'
import { startController } from './controller.js'

export const start = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeWasteDataStart,
      ...startController.get
    },
    {
      method: 'POST',
      path: paths.prototypeWasteDataStart,
      ...startController.post
    }
  ]
}
