import { paths } from '../../../../../config/paths.js'
import { wasteReturnsController } from './controller.js'

export const wasteReturns = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeAbtoWasteReturns,
      ...wasteReturnsController
    }
  ]
}
