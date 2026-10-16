import { paths } from '../../../../../config/paths.js'
import { sentController } from './controller.js'

export const preRegistrationLinkSent = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorPreRegistrationLinkSent,
      ...sentController.get
    },
    {
      method: 'GET',
      path: paths.prototypeRegulatorPreRegistrationLinkResend,
      ...sentController.resend
    }
  ]
}
