import { storage } from '../../storage-adapter.js'
import { requireAuth } from '../../auth-gate.js'
import { readPagePayload } from '../../page-payload.js'

const setText = (doc, testId, value) => {
  doc.querySelector(`[data-testid="${testId}"]`).textContent = value || '—'
}

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

export const renderSchemeRepresented = (doc = globalThis.document) => {
  if (!requireAuth('/sign-in')) return false

  const payload = readPagePayload(doc)
  const registration = storage.getRegistration(payload.registrationId)
  const scheme = registration?.schemeId
    ? storage.getScheme(registration.schemeId)
    : null

  setText(doc, 'scheme-represented-scheme-name', scheme?.name)
  setText(
    doc,
    'scheme-represented-period',
    registration?.compliancePeriod ?? payload.compliancePeriod
  )

  const rosterAt = scheme?.lastRosterAt
  setText(
    doc,
    'scheme-represented-roster',
    rosterAt ? formatDate(rosterAt) : payload.labels.rosterPending
  )

  return 'rendered'
}
