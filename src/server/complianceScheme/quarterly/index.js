import { paths } from '../../../config/paths.js'
import { quarterlyController } from './controller.js'

export const complianceSchemeQuarterly = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.complianceSchemeQuarterly,
      ...quarterlyController.get
    },
    {
      method: 'POST',
      path: paths.complianceSchemeQuarterly,
      ...quarterlyController.post
    }
  ]
}
