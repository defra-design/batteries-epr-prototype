import { paths } from '../../../../../config/paths.js'
import { applicationSchemeRecordController } from './controller.js'

export const applicationSchemeRecord = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorApplicationSchemeRecord,
      ...applicationSchemeRecordController
    }
  ]
}
