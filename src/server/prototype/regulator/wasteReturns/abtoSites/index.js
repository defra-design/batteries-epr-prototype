import { paths } from '../../../../../config/paths.js'
import { abtoSitesController } from './controller.js'

export const abtoSites = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorWasteReturnsAbtoSites,
      ...abtoSitesController.get
    },
    {
      method: 'POST',
      path: paths.prototypeRegulatorWasteReturnsAbtoSites,
      ...abtoSitesController.post
    }
  ]
}
