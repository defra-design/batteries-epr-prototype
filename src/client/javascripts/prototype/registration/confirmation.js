import { prototypeRegistrationContent } from '../../../../config/prototype-registration-content.js'

const byTestId = (doc, testId) => doc.querySelector(`[data-testid="${testId}"]`)

export const renderConfirmation = (doc, draft) => {
  byTestId(doc, 'complete-email').textContent =
    draft.appropriatePersonEmail || ''

  if (draft.bprn) {
    byTestId(doc, 'complete-bprn').textContent = draft.bprn
    return 'bprn'
  }

  byTestId(doc, 'complete-panel-title').textContent =
    prototypeRegistrationContent.complete.submittedPanelTitle
  byTestId(doc, 'complete-panel-body').hidden = true
  byTestId(doc, 'complete-bprn-bullet').hidden = true
  return 'submitted'
}
