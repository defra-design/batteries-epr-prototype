import { paths } from '../../../config/paths.js'
import { declarationController } from './controller.js'

export const leaveSchemeDeclaration = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.leaveSchemeDeclaration,
      ...declarationController.get
    },
    {
      method: 'POST',
      path: paths.leaveSchemeDeclaration,
      ...declarationController.post
    }
  ]
}
