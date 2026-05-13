import { paths } from '../../../../config/paths.js'
import { tonnagesController } from './controller.js'

export const tonnages = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.annualReturnIaTonnages,
      ...tonnagesController.get
    },
    {
      method: 'POST',
      path: paths.annualReturnIaTonnages,
      ...tonnagesController.post
    }
  ]
}
