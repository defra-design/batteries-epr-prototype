import { paths } from '../../../../../config/paths.js'
import { submittedController } from './controller.js'

export const submitted = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeMembersListSubmitted,
      ...submittedController
    }
  ]
}
