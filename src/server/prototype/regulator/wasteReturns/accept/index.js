import { paths } from '../../../../../config/paths.js'
import { acceptConfirmController, acceptedController } from './controller.js'

export const accept = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorWasteReturnsAcceptConfirm,
      ...acceptConfirmController.get
    },
    {
      method: 'POST',
      path: paths.prototypeRegulatorWasteReturnsAcceptConfirm,
      ...acceptConfirmController.post
    },
    {
      method: 'GET',
      path: paths.prototypeRegulatorWasteReturnsAccepted,
      ...acceptedController
    }
  ]
}
