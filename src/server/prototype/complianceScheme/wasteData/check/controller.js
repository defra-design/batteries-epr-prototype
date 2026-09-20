import { paths } from '../../../../../config/paths.js'
import { PROTOTYPE_ABTO_OPERATOR_NAME } from '../../../../../config/prototype-abto-content.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'
import { buildHydrationPayload, taskFlowPageModel } from '../shared.js'

export const checkController = {
  handler(_request, h) {
    const pageContent = prototypeComplianceSchemeContent.wasteData.check

    return h.view('prototype/complianceScheme/wasteData/check/view', {
      ...taskFlowPageModel(pageContent),
      backLink: paths.prototypeWasteDataEnter,
      receivingOperator: PROTOTYPE_ABTO_OPERATOR_NAME,
      continueUrl: paths.prototypeWasteDataDeclaration,
      pagePayload: buildHydrationPayload('check', {
        enterUrl: paths.prototypeWasteDataEnter
      })
    })
  }
}
