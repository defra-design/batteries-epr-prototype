import { paths } from '../../../../config/paths.js'
import { taskStartController } from './controller.js'

export const taskStart = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeSubmissionTaskStart,
      ...taskStartController
    }
  ]
}
