import { paths } from '../../../../../config/paths.js'
import { dataCheckReportController } from './controller.js'

export const dataCheckReport = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorPomSubmissionDataCheckReport,
      ...dataCheckReportController
    }
  ]
}
