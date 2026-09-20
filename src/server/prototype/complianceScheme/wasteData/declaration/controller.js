import { paths } from '../../../../../config/paths.js'
import { PROTOTYPE_ABTO_OPERATOR_NAME } from '../../../../../config/prototype-abto-content.js'
import {
  PROTOTYPE_COMPLIANCE_SCHEME_NAME,
  prototypeComplianceSchemeContent
} from '../../../../../config/prototype-compliance-scheme-content.js'
import {
  buildHydrationPayload,
  fill,
  getSubmitterName,
  taskFlowPageModel
} from '../shared.js'

const pageContent = () => prototypeComplianceSchemeContent.wasteData.declaration

const renderView = (h, pagePayload) => {
  const content = pageContent()
  const submitter = getSubmitterName()

  return h.view('prototype/complianceScheme/wasteData/declaration/view', {
    ...taskFlowPageModel(content),
    backLink: paths.prototypeWasteDataCheck,
    action: paths.prototypeWasteDataDeclaration,
    submittedBy: fill(content.submittedByTemplate, { name: submitter }),
    pagePayload
  })
}

export const declarationController = {
  get: {
    handler(_request, h) {
      return renderView(
        h,
        buildHydrationPayload('declaration', {
          enterUrl: paths.prototypeWasteDataEnter
        })
      )
    }
  },

  post: {
    handler(_request, h) {
      return renderView(h, {
        step: 'declaration',
        target: 'submit',
        submission: {
          schemeName: PROTOTYPE_COMPLIANCE_SCHEME_NAME,
          submittedBy: getSubmitterName(),
          receivingOperator: PROTOTYPE_ABTO_OPERATOR_NAME
        },
        nextStep: paths.prototypeWasteDataSubmitted
      })
    }
  }
}
