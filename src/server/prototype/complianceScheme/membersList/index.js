import { start } from './start/index.js'
import { howToSend } from './howToSend/index.js'
import { uploadCsv } from './uploadCsv/index.js'
import { reviewUpload } from './reviewUpload/index.js'
import { submitted } from './submitted/index.js'
import { addMember } from './addMember/index.js'

export const prototypeComplianceSchemeMembersList = {
  openRoutes: [
    ...start.openRoutes,
    ...howToSend.openRoutes,
    ...uploadCsv.openRoutes,
    ...reviewUpload.openRoutes,
    ...submitted.openRoutes,
    ...addMember.openRoutes
  ]
}
