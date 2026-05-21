import { paths } from '../../../config/paths.js'
import { schemeSelectController } from './controller.js'

export const schemeSelect = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.onboardingSchemeSelect,
      ...schemeSelectController.get
    },
    {
      method: 'POST',
      path: paths.onboardingSchemeSelect,
      ...schemeSelectController.post
    }
  ]
}
