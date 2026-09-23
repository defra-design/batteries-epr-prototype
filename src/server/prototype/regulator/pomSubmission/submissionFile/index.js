import { paths } from '../../../../../config/paths.js'
import { submissionFileController } from './controller.js'

export const submissionFile = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorPomSubmissionSubmissionFile,
      ...submissionFileController
    }
  ]
}
