import { signIn } from './signIn/index.js'
import { dashboard } from './dashboard/index.js'
import { members } from './members/index.js'
import { submissions } from './submissions/index.js'
import { beforeYouStart } from './beforeYouStart/index.js'
import { reportingMethod } from './reportingMethod/index.js'
import { bulkUpload } from './bulkUpload/index.js'
import { uploading } from './uploading/index.js'
import { errors } from './errors/index.js'
import { uploadSuccess } from './uploadSuccess/index.js'

export const prototypeComplianceSchemePomSubmission = {
  openRoutes: [
    ...signIn.openRoutes,
    ...dashboard.openRoutes,
    ...members.openRoutes,
    ...submissions.openRoutes,
    ...beforeYouStart.openRoutes,
    ...reportingMethod.openRoutes,
    ...bulkUpload.openRoutes,
    ...uploading.openRoutes,
    ...errors.openRoutes,
    ...uploadSuccess.openRoutes
  ]
}
