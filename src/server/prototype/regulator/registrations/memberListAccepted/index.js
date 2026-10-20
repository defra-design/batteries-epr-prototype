import { paths } from '../../../../../config/paths.js'
import { memberListAcceptedController } from './controller.js'

export const memberListAccepted = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorSchemeMemberListAccepted,
      ...memberListAcceptedController
    }
  ]
}
