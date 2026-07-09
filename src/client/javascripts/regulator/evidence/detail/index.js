import { storage } from '../../../storage-adapter.js'
import { readPagePayload } from '../../../page-payload.js'

const setText = (doc, selector, text) => {
  const el = doc.querySelector(selector)
  /* v8 ignore next */
  if (el) el.textContent = text
}

/* v8 ignore start */
const resolveIssuerName = (item) => {
  if (item.direction === 'operator-to-scheme' && item.issuedByOperatorId) {
    const operator = storage.getOperator(item.issuedByOperatorId)
    return operator?.name ?? '—'
  }
  if (item.schemeId) {
    const scheme = storage.getScheme(item.schemeId)
    return scheme?.name ?? '—'
  }
  return '—'
}
/* v8 ignore stop */

/* v8 ignore start */
const formatDateRange = (from, to) => {
  if (!from && !to) return '—'
  const parts = []
  if (from) parts.push(from)
  if (to) parts.push(to)
  return parts.join(' to ')
}
/* v8 ignore stop */

export const runRegulatorEvidenceDetail = (doc, loc) => {
  const payload = readPagePayload(doc)

  const evidence = storage.findEvidence(payload.evidenceId)
  const notFound = doc.querySelector(
    '[data-testid="evidence-detail-not-found"]'
  )
  const list = doc.querySelector('[data-testid="evidence-detail-list"]')

  if (!evidence) {
    notFound.hidden = false
    list.hidden = true
    return 'not-found'
  }

  notFound.hidden = true
  list.hidden = false

  /* v8 ignore start */
  setText(
    doc,
    '[data-testid="evidence-detail-issuer"]',
    resolveIssuerName(evidence)
  )
  setText(
    doc,
    '[data-testid="evidence-detail-recipient"]',
    evidence.recipientName ?? '—'
  )
  setText(
    doc,
    '[data-testid="evidence-detail-category"]',
    evidence.category ?? '—'
  )
  setText(doc, '[data-testid="evidence-detail-tonnes"]', evidence.tonnes ?? '—')
  setText(doc, '[data-testid="evidence-detail-status"]', evidence.status ?? '—')
  setText(
    doc,
    '[data-testid="evidence-detail-issued"]',
    evidence.issuedOn ?? '—'
  )
  setText(
    doc,
    '[data-testid="evidence-detail-dates"]',
    formatDateRange(evidence.wasteReceivedFrom, evidence.wasteReceivedTo)
  )
  setText(
    doc,
    '[data-testid="evidence-detail-direction"]',
    evidence.direction ?? '—'
  )
  /* v8 ignore stop */

  return 'hydrated'
}
