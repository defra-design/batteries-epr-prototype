const byTestId = (doc, testId) => doc.querySelector(`[data-testid="${testId}"]`)

const fill = (template, values) =>
  Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template
  )

const setText = (doc, testId, text) => {
  const el = byTestId(doc, testId)
  if (el) el.textContent = text
}

const formatSubmittedDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  })

export const renderSubmitted = (doc, draft, payload) => {
  setText(
    doc,
    'waste-data-submitted-reference',
    fill(payload.referenceTemplate, { reference: draft.reference })
  )
  setText(
    doc,
    'waste-data-submitted-collected',
    fill(payload.collectedTemplate, { tonnes: draft.collectedTonnes })
  )
  setText(
    doc,
    'waste-data-submitted-delivered',
    fill(payload.deliveredTemplate, { tonnes: draft.deliveredTonnes })
  )
  setText(
    doc,
    'waste-data-submitted-by',
    fill(payload.submittedByTemplate, {
      date: formatSubmittedDate(draft.submittedAt)
    })
  )
}
