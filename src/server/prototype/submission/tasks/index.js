import { paths } from '../../../../config/paths.js'
import { tasksController } from './controller.js'

export const tasks = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeSubmissionTasks,
      ...tasksController
    }
  ]
}
