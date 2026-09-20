import { paths } from '../../../../../config/paths.js'
import { schemeHomeController } from './controller.js'

export const schemeHome = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorPomSubmissionSchemeHome,
      ...schemeHomeController
    }
  ]
}
