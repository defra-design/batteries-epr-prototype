const byTestId = (doc, testId) => doc.querySelector(`[data-testid="${testId}"]`)

export const renderCheck = (doc, draft) => {
  const collectedEl = byTestId(doc, 'waste-data-check-collected')
  /* v8 ignore next */
  if (collectedEl) collectedEl.textContent = draft.collectedTonnes

  const deliveredEl = byTestId(doc, 'waste-data-check-delivered')
  /* v8 ignore next */
  if (deliveredEl) deliveredEl.textContent = draft.deliveredTonnes
}
