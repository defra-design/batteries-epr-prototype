import { paths } from '../../../../config/paths.js'
import { dataController } from './controller.js'

export const data = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeSubmissionData,
      ...dataController.get
    },
    {
      method: 'POST',
      path: paths.prototypeSubmissionData,
      ...dataController.post
    }
  ]
}
