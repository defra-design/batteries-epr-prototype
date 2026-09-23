import { paths } from '../../../../../config/paths.js'
import { submissionFilesController } from './controller.js'

export const submissionFiles = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorPomSubmissionSubmissionFiles,
      ...submissionFilesController
    }
  ]
}
