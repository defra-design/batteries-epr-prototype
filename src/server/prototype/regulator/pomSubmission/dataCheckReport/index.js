import { paths } from '../../../../../config/paths.js'
import { dataCheckReportController } from './controller.js'

export const dataCheckReport = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorPomSubmissionDataCheckReport,
      ...dataCheckReportController.get
    },
    {
      method: 'POST',
      path: paths.prototypeRegulatorPomSubmissionDataCheckReport,
      ...dataCheckReportController.post
    }
  ]
}
