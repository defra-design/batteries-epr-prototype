import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'

const byTestId = (doc, testId) => doc.querySelector(`[data-testid="${testId}"]`)

export const renderReviewUpload = (doc, draft) => {
  const pageContent = prototypeComplianceSchemeContent.membersList.reviewUpload
  const fixes = draft.fixes || {}

  Object.keys(fixes).forEach((memberId) => {
    byTestId(doc, `review-upload-status-${memberId}`).textContent =
      pageContent.validStatus
    byTestId(doc, `review-upload-action-${memberId}`).textContent =
      pageContent.fixedAction
  })
}
