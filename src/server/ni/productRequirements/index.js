import { paths } from '../../../config/paths.js'
import { niProductRequirementsController } from './controller.js'

export const niProductRequirements = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.niProductRequirements,
      ...niProductRequirementsController
    }
  ]
}
