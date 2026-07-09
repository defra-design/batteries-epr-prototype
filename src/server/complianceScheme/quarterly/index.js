import { paths } from '../../../config/paths.js'
import { quarterlyController, quarterlyMemberController } from './controller.js'

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
    },
    {
      method: 'GET',
      path: paths.complianceSchemeQuarterlyMember,
      ...quarterlyMemberController.get
    },
    {
      method: 'POST',
      path: paths.complianceSchemeQuarterlyMember,
      ...quarterlyMemberController.post
    }
  ]
}
