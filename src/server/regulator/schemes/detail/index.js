import { paths } from '../../../../config/paths.js'
import { detailController } from './controller.js'

export const regulatorSchemeDetail = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.regulatorSchemeDetail,
      ...detailController.get
    },
    {
      method: 'POST',
      path: paths.regulatorSchemeDetail,
      ...detailController.post
    }
  ]
}
