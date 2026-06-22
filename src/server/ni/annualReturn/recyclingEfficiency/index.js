import { paths } from '../../../../config/paths.js'
import { recyclingEfficiencyController } from './controller.js'

export const recyclingEfficiency = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.niAnnualReturnRecycling,
      ...recyclingEfficiencyController.get
    },
    {
      method: 'POST',
      path: paths.niAnnualReturnRecycling,
      ...recyclingEfficiencyController.post
    }
  ]
}
