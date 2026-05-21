import { membersList } from './list/index.js'
import { membersAdd } from './add/index.js'
import { membersRemove } from './remove/index.js'

export const complianceSchemeMembers = {
  openRoutes: [
    ...membersList.openRoutes,
    ...membersAdd.openRoutes,
    ...membersRemove.openRoutes
  ]
}
