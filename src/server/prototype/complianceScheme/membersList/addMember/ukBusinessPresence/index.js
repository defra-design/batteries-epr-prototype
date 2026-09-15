import { paths } from '../../../../../../config/paths.js'
import { ukBusinessPresenceController } from './controller.js'

export const ukBusinessPresence = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeMembersListAddMemberUkBusinessPresence,
      ...ukBusinessPresenceController.get
    },
    {
      method: 'POST',
      path: paths.prototypeMembersListAddMemberUkBusinessPresence,
      ...ukBusinessPresenceController.post
    }
  ]
}
