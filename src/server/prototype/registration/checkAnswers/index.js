import { paths } from '../../../../config/paths.js'
import { checkAnswersController } from './controller.js'

export const checkAnswers = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegistrationCheckAnswers,
      ...checkAnswersController
    }
  ]
}
