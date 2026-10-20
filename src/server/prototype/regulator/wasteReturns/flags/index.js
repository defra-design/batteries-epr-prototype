import { paths } from '../../../../../config/paths.js'
import { flagsController } from './controller.js'

export const flags = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorWasteReturnsFlags,
      ...flagsController
    }
  ]
}
