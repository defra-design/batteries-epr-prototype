import { paths } from '../../../../config/paths.js'
import { brandAddController } from './controller.js'

export const brandAdd = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeSubmissionBrandAdd,
      ...brandAddController.get
    },
    {
      method: 'POST',
      path: paths.prototypeSubmissionBrandAdd,
      ...brandAddController.post
    }
  ]
}
