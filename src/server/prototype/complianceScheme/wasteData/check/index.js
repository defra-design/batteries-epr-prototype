import { paths } from '../../../../../config/paths.js'
import { checkController } from './controller.js'

export const check = {
  openRoutes: [
    { method: 'GET', path: paths.prototypeWasteDataCheck, ...checkController }
  ]
}
