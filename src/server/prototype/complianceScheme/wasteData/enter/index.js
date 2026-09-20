import { paths } from '../../../../../config/paths.js'
import { enterController } from './controller.js'

export const enter = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeWasteDataEnter,
      ...enterController.get
    },
    {
      method: 'POST',
      path: paths.prototypeWasteDataEnter,
      ...enterController.post
    }
  ]
}
