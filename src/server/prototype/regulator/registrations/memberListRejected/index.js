import { paths } from '../../../../../config/paths.js'
import { memberListRejectedController } from './controller.js'

export const memberListRejected = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorSchemeMemberListRejected,
      ...memberListRejectedController
    }
  ]
}
