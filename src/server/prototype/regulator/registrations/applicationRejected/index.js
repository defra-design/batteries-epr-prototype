import { paths } from '../../../../../config/paths.js'
import { applicationRejectedController } from './controller.js'

export const applicationRejected = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorApplicationRejected,
      ...applicationRejectedController
    }
  ]
}
