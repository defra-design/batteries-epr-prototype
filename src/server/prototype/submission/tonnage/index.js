import { paths } from '../../../../config/paths.js'
import { tonnageController } from './controller.js'

export const tonnage = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeSubmissionTonnage,
      ...tonnageController.get
    },
    {
      method: 'POST',
      path: paths.prototypeSubmissionTonnage,
      ...tonnageController.post
    }
  ]
}
