import { paths } from '../../../../../config/paths.js'
import { returnQueriedController } from './controller.js'

export const returnQueried = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeComplianceSchemeQueryResponseReturnQueried,
      ...returnQueriedController
    }
  ]
}
