import { paths } from '../../../../config/paths.js'
import { brandQuestionController } from './controller.js'

export const brandQuestion = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeSubmissionBrandQuestion,
      ...brandQuestionController.get
    },
    {
      method: 'POST',
      path: paths.prototypeSubmissionBrandQuestion,
      ...brandQuestionController.post
    }
  ]
}
