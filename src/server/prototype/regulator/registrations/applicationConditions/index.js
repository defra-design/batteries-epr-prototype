import { paths } from '../../../../../config/paths.js'
import { applicationConditionsController } from './controller.js'

export const applicationConditions = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorApplicationConditions,
      ...applicationConditionsController
    }
  ]
}
