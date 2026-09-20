import { paths } from '../../../../../config/paths.js'
import { PROTOTYPE_ABTO_OPERATOR_NAME } from '../../../../../config/prototype-abto-content.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'
import { formatDate } from '../../../../../config/nunjucks/filters/format-date.js'
import {
  buildHydrationPayload,
  fill,
  getQ3DueOn,
  getSubmitterName,
  taskFlowPageModel
} from '../shared.js'

const PLACEHOLDER = '—'

export const submittedController = {
  handler(_request, h) {
    const pageContent = prototypeComplianceSchemeContent.wasteData.submitted
    const submitter = getSubmitterName()

    return h.view('prototype/complianceScheme/wasteData/submitted/view', {
      ...taskFlowPageModel(pageContent),
      // A submitted return is not returned to: no back link, only a way
      // back to the account home in the body.
      accountHomeUrl: paths.prototypeWasteDataAccountHome,
      bannerBody: fill(pageContent.banner.referenceTemplate, {
        reference: PLACEHOLDER
      }),
      collectedValue: PLACEHOLDER,
      deliveredValue: PLACEHOLDER,
      submittedByValue: fill(pageContent.submittedByTemplate, {
        name: submitter,
        date: PLACEHOLDER
      }),
      statusValue: fill(pageContent.statusTemplate, {
        date: formatDate(getQ3DueOn(), 'd MMMM yyyy')
      }),
      pagePayload: buildHydrationPayload('submitted', {
        accountHomeUrl: paths.prototypeWasteDataAccountHome,
        referenceTemplate: pageContent.banner.referenceTemplate,
        collectedTemplate: pageContent.collectedTemplate,
        deliveredTemplate: fill(pageContent.deliveredTemplate, {
          operator: PROTOTYPE_ABTO_OPERATOR_NAME
        }),
        submittedByTemplate: fill(pageContent.submittedByTemplate, {
          name: submitter
        })
      })
    })
  }
}
