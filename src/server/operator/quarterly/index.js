import { paths } from '../../../config/paths.js'
import { operatorQuarterlyController } from './controller.js'

export const operatorQuarterly = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.operatorQuarterly,
      ...operatorQuarterlyController.get
    },
    {
      method: 'POST',
      path: paths.operatorQuarterly,
      ...operatorQuarterlyController.post
    }
  ]
}
