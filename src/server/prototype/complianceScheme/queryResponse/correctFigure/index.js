import { paths } from '../../../../../config/paths.js'
import { correctFigureController } from './controller.js'

export const correctFigure = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeComplianceSchemeQueryResponseCorrectFigure,
      ...correctFigureController.get
    },
    {
      method: 'POST',
      path: paths.prototypeComplianceSchemeQueryResponseCorrectFigure,
      ...correctFigureController.post
    }
  ]
}
