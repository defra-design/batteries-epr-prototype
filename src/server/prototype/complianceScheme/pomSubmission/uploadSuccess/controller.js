import {
  prototypeComplianceSchemeContent,
  PROTOTYPE_COMPLIANCE_SCHEME_NAME
} from '../../../../../config/prototype-compliance-scheme-content.js'
import { taskFlowPageModel } from '../shared.js'

const referenceFor = (year, quarter) => {
  const token = PROTOTYPE_COMPLIANCE_SCHEME_NAME.split(' ')[0]
    .slice(0, 2)
    .toUpperCase()
  return `Q${quarter}-${year}-${token}-00417`
}

export const uploadSuccessController = {
  handler(request, h) {
    const { year, quarter } = request.params
    const pageContent = prototypeComplianceSchemeContent.uploadSuccess
    const reference = referenceFor(year, quarter)
    const referenceLine = pageContent.referenceTemplate.replace(
      '{reference}',
      reference
    )

    const summaryRows = [
      {
        key: pageContent.rowsProcessedLabel,
        value: pageContent.rowsProcessedValue
      },
      { key: pageContent.acceptedLabel, value: pageContent.acceptedValue },
      { key: pageContent.heldLabel, value: pageContent.heldValue },
      { key: pageContent.submittedLabel, value: pageContent.submittedValue }
    ]

    return h.view(
      'prototype/complianceScheme/pomSubmission/uploadSuccess/view',
      {
        ...taskFlowPageModel(pageContent),
        caption: `${year} ${pageContent.complianceCaption}`,
        referenceLine,
        summaryRows
      }
    )
  }
}
