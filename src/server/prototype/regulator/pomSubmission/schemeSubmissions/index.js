import { paths } from '../../../../../config/paths.js'
import { schemeSubmissionsController } from './controller.js'

export const schemeSubmissions = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorPomSubmissionSchemeSubmissions,
      ...schemeSubmissionsController
    }
  ]
}
