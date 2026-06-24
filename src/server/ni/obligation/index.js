import { paths } from '../../../config/paths.js'
import { niObligationController } from './controller.js'

export const niObligation = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.niObligation,
      ...niObligationController
    }
  ]
}
