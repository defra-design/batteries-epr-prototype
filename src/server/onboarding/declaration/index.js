import { paths } from '../../../config/paths.js'
import { declarationController } from './controller.js'

export const declaration = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.onboardingDeclaration,
      ...declarationController.get
    },
    {
      method: 'POST',
      path: paths.onboardingDeclaration,
      ...declarationController.post
    }
  ]
}
