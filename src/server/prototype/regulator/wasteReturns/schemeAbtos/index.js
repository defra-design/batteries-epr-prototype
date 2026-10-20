import { paths } from '../../../../../config/paths.js'
import { schemeAbtosController } from './controller.js'

export const schemeAbtos = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorWasteReturnsSchemeAbtos,
      ...schemeAbtosController
    }
  ]
}
