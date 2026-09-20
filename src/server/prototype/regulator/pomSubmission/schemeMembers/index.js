import { paths } from '../../../../../config/paths.js'
import { schemeMembersController } from './controller.js'

export const schemeMembers = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorPomSubmissionSchemeMembers,
      ...schemeMembersController
    }
  ]
}
