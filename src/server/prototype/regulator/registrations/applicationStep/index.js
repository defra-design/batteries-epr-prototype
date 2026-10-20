import { paths } from '../../../../../config/paths.js'
import { applicationStepController } from './controller.js'

export const applicationStep = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorApplicationStep,
      ...applicationStepController.get
    },
    {
      method: 'POST',
      path: paths.prototypeRegulatorApplicationStep,
      ...applicationStepController.post
    }
  ]
}
