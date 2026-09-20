const byTestId = (doc, testId) => doc.querySelector(`[data-testid="${testId}"]`)

const fill = (template, values) =>
  Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template
  )

const setTagColour = (tag, colour) => {
  tag.className = tag.className
    .split(' ')
    .filter((name) => !name.startsWith('govuk-tag--'))
    .concat(`govuk-tag--${colour}`)
    .join(' ')
}

export const renderAccountHome = (doc, draft, payload) => {
  if (draft.collectedTonnes) {
    const collectedEl = byTestId(doc, 'waste-data-collected-value')
    if (collectedEl) {
      collectedEl.textContent = fill(payload.collectedValueTemplate, {
        tonnes: draft.collectedTonnes
      })
    }
  }

  if (draft.status !== 'submitted') return

  const statusEl = byTestId(doc, `waste-data-quarter-${payload.quarter}-status`)
  if (statusEl) {
    statusEl.textContent = payload.submittedStatus.label
    setTagColour(statusEl, payload.submittedStatus.colour)
  }

  const actionEl = byTestId(doc, `waste-data-quarter-${payload.quarter}-action`)
  if (actionEl) {
    actionEl.setAttribute('href', payload.submittedUrl)
    actionEl.firstChild.textContent = payload.submittedStatus.actionText
  }
}
