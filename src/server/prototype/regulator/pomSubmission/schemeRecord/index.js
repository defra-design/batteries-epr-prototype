import { paths } from '../../../../../config/paths.js'
import { schemeRecordController } from './controller.js'

export const schemeRecord = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorPomSubmissionSchemeRecord,
      ...schemeRecordController
    }
  ]
}
