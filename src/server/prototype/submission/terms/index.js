import { paths } from '../../../../config/paths.js'
import { termsController } from './controller.js'

export const terms = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeSubmissionTerms,
      ...termsController.get
    },
    {
      method: 'POST',
      path: paths.prototypeSubmissionTerms,
      ...termsController.post
    }
  ]
}
