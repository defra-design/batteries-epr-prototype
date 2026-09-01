import { paths } from '../../../../config/paths.js'
import { brandConfirmController } from './controller.js'

export const brandConfirm = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeSubmissionBrandConfirm,
      ...brandConfirmController
    }
  ]
}
