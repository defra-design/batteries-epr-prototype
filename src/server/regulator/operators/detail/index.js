import { paths } from '../../../../config/paths.js'
import { detailController } from './controller.js'

export const regulatorOperatorDetail = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.regulatorOperatorDetail,
      ...detailController.get
    },
    {
      method: 'POST',
      path: paths.regulatorOperatorDetail,
      ...detailController.post
    }
  ]
}
