const byTestId = (doc, testId) => doc.querySelector(`[data-testid="${testId}"]`)

export const renderCheck = (doc, draft) => {
  const collectedEl = byTestId(doc, 'waste-data-check-collected')
  if (collectedEl) collectedEl.textContent = draft.collectedTonnes

  const deliveredEl = byTestId(doc, 'waste-data-check-delivered')
  if (deliveredEl) deliveredEl.textContent = draft.deliveredTonnes
}
