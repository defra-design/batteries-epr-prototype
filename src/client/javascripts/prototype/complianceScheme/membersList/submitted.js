const byTestId = (doc, testId) => doc.querySelector(`[data-testid="${testId}"]`)

export const renderSubmitted = (doc, draft) => {
  const filenameEl = byTestId(doc, 'submitted-filename')
  if (filenameEl && draft.uploadedFileName) {
    filenameEl.textContent = draft.uploadedFileName
  }
}
