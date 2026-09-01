import { paths } from '../../../../config/paths.js'
import { appropriatePersonController } from './controller.js'

export const appropriatePerson = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegistrationAppropriatePerson,
      ...appropriatePersonController.get
    },
    {
      method: 'POST',
      path: paths.prototypeRegistrationAppropriatePerson,
      ...appropriatePersonController.post
    }
  ]
}
