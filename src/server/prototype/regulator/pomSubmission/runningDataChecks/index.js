import { paths } from '../../../../../config/paths.js'
import { runningDataChecksController } from './controller.js'

export const runningDataChecks = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorPomSubmissionRunningDataChecks,
      ...runningDataChecksController
    }
  ]
}
