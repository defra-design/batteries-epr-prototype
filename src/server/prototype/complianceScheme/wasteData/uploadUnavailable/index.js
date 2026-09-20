import { paths } from '../../../../../config/paths.js'
import { uploadUnavailableController } from './controller.js'

export const uploadUnavailable = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeWasteDataUploadUnavailable,
      ...uploadUnavailableController
    }
  ]
}
