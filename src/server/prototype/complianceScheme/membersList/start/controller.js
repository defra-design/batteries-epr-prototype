import { paths } from '../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'
import { taskFlowPageModel } from '../shared.js'

export const startController = {
  handler(_request, h) {
    const pageContent = prototypeComplianceSchemeContent.membersList.start

    return h.view('prototype/complianceScheme/membersList/start/view', {
      ...taskFlowPageModel(pageContent),
      backLink: paths.prototype,
      startUrl: paths.prototypeMembersListHowToSend
    })
  }
}
