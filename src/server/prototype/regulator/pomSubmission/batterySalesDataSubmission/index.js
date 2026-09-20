import { paths } from '../../../../../config/paths.js'
import { batterySalesDataSubmissionController } from './controller.js'

export const batterySalesDataSubmission = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorPomSubmissionBatterySalesDataSubmission,
      ...batterySalesDataSubmissionController
    }
  ]
}
