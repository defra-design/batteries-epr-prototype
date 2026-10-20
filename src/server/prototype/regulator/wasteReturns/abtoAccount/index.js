import { paths } from '../../../../../config/paths.js'
import { abtoAccountController } from './controller.js'

export const abtoAccount = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorWasteReturnsAbtoAccount,
      ...abtoAccountController
    }
  ]
}
