import { paths } from '../../../../config/paths.js'
import { placedOnMarketController } from './controller.js'

export const placedOnMarket = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.niAnnualReturnPlaced,
      ...placedOnMarketController.get
    },
    {
      method: 'POST',
      path: paths.niAnnualReturnPlaced,
      ...placedOnMarketController.post
    }
  ]
}
