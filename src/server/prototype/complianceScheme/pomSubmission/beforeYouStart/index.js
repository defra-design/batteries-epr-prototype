import { paths } from '../../../../../config/paths.js'
import { beforeYouStartController } from './controller.js'

export const beforeYouStart = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeComplianceSchemeSubmissionBeforeYouStart,
      ...beforeYouStartController
    }
  ]
}
