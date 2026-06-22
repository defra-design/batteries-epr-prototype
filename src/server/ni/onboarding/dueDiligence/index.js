import { paths } from '../../../../config/paths.js'
import { dueDiligenceController } from './controller.js'

export const dueDiligence = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.niOnboardingDueDiligence,
      ...dueDiligenceController.get
    },
    {
      method: 'POST',
      path: paths.niOnboardingDueDiligence,
      ...dueDiligenceController.post
    }
  ]
}
