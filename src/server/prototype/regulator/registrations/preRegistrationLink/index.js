import { paths } from '../../../../../config/paths.js'
import { preRegistrationLinkController } from './controller.js'

export const preRegistrationLink = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorPreRegistrationLink,
      ...preRegistrationLinkController.get
    },
    {
      method: 'POST',
      path: paths.prototypeRegulatorPreRegistrationLink,
      ...preRegistrationLinkController.post
    }
  ]
}
