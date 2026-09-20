import { paths } from '../../../../../config/paths.js'
import { figureResentController } from './controller.js'

export const figureResent = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeComplianceSchemeQueryResponseFigureResent,
      ...figureResentController
    }
  ]
}
