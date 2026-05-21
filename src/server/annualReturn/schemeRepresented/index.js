import { paths } from '../../../config/paths.js'
import { schemeRepresentedController } from './controller.js'

export const schemeRepresented = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.annualReturnSchemeRepresented,
      ...schemeRepresentedController.get
    },
    {
      method: 'POST',
      path: paths.annualReturnSchemeRepresented,
      ...schemeRepresentedController.post
    }
  ]
}
