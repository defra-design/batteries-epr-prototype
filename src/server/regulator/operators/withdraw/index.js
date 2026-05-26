import { paths } from '../../../../config/paths.js'
import { withdrawController } from './controller.js'

export const regulatorOperatorWithdraw = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.regulatorOperatorWithdraw,
      ...withdrawController.get
    },
    {
      method: 'POST',
      path: paths.regulatorOperatorWithdraw,
      ...withdrawController.post
    }
  ]
}
