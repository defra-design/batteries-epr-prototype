import { paths } from '../../../../../config/paths.js'
import { howToSendController } from './controller.js'

export const howToSend = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeMembersListHowToSend,
      ...howToSendController.get
    },
    {
      method: 'POST',
      path: paths.prototypeMembersListHowToSend,
      ...howToSendController.post
    }
  ]
}
