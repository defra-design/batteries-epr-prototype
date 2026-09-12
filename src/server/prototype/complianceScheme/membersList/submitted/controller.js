import { paths } from '../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'
import { taskFlowPageModel } from '../shared.js'

export const submittedController = {
  handler(_request, h) {
    const pageContent = prototypeComplianceSchemeContent.membersList.submitted

    return h.view('prototype/complianceScheme/membersList/submitted/view', {
      ...taskFlowPageModel(pageContent),
      backLink: paths.prototypeMembersListReviewUpload,
      prototypeUrl: paths.prototype,
      pagePayload: { step: 'submitted', target: 'hydrate' }
    })
  }
}
