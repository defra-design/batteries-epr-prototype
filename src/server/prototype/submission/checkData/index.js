import { paths } from '../../../../config/paths.js'
import { checkDataController } from './controller.js'

export const checkData = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeSubmissionCheckData,
      ...checkDataController.get
    },
    {
      method: 'POST',
      path: paths.prototypeSubmissionCheckData,
      ...checkDataController.post
    }
  ]
}
