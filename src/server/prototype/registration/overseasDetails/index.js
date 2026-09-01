import { paths } from '../../../../config/paths.js'
import { overseasDetailsController } from './controller.js'

export const overseasDetails = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegistrationOverseasDetails,
      ...overseasDetailsController.get
    },
    {
      method: 'POST',
      path: paths.prototypeRegistrationOverseasDetails,
      ...overseasDetailsController.post
    }
  ]
}
