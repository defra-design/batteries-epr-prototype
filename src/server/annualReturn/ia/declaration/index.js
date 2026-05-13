import { paths } from '../../../../config/paths.js'
import { declarationController } from './controller.js'

export const declaration = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.annualReturnIaDeclaration,
      ...declarationController.get
    },
    {
      method: 'POST',
      path: paths.annualReturnIaDeclaration,
      ...declarationController.post
    }
  ]
}
