import { paths } from '../../../../config/paths.js'
import { schemeMembershipController } from './controller.js'

export const schemeMembership = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegistrationSchemeMembership,
      ...schemeMembershipController.get
    },
    {
      method: 'POST',
      path: paths.prototypeRegistrationSchemeMembership,
      ...schemeMembershipController.post
    }
  ]
}
