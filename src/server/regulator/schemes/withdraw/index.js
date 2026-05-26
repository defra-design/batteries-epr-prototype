import { paths } from '../../../../config/paths.js'
import { withdrawController } from './controller.js'

export const regulatorSchemeWithdraw = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.regulatorSchemeWithdraw,
      ...withdrawController.get
    },
    {
      method: 'POST',
      path: paths.regulatorSchemeWithdraw,
      ...withdrawController.post
    }
  ]
}
