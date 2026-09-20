import { paths } from '../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'
import { taskFlowPageModel } from '../shared.js'

export const uploadUnavailableController = {
  handler(_request, h) {
    const pageContent =
      prototypeComplianceSchemeContent.wasteData.uploadUnavailable

    return h.view(
      'prototype/complianceScheme/wasteData/uploadUnavailable/view',
      {
        ...taskFlowPageModel(pageContent),
        backLink: paths.prototypeWasteDataStart,
        startUrl: paths.prototypeWasteDataStart
      }
    )
  }
}
