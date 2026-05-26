import { storage } from '../../../storage-adapter.js'
import { readPagePayload } from '../../../page-payload.js'

const setText = (doc, selector, text) => {
  const el = doc.querySelector(selector)
  /* v8 ignore next */
  if (el) el.textContent = text
}

const formatAddress = (address) => {
  if (!address) return '—'
  return [address.line1, address.line2, address.line3, address.line4, address.town, address.postcode]
    .filter(Boolean)
    .join(', ')
}

export const runRegulatorSchemeDetail = (doc, loc) => {
  const payload = readPagePayload(doc)

  if (payload.target === 'persist') {
    if (payload.action === 'approve') {
      storage.approveScheme(payload.schemeId, payload.approvalNumber)
    } else {
      storage.rejectScheme(payload.schemeId)
    }
    loc.assign('/regulator/schemes')
    return 'navigated'
  }

  const scheme = storage.getScheme(payload.schemeId)
  const notFound = doc.querySelector('[data-testid="scheme-detail-not-found"]')
  const list = doc.querySelector('[data-testid="scheme-detail-list"]')
  const actions = doc.querySelector('[data-testid="scheme-detail-actions"]')

  if (!scheme) {
    notFound.hidden = false
    list.hidden = true
    actions.hidden = true
    return 'not-found'
  }

  notFound.hidden = true
  list.hidden = false

  /* v8 ignore start */
  setText(doc, '[data-testid="scheme-detail-name"]', scheme.name ?? '—')
  setText(doc, '[data-testid="scheme-detail-operator"]', scheme.operator ?? '—')
  setText(doc, '[data-testid="scheme-detail-address"]', formatAddress(scheme.registeredAddress))
  setText(doc, '[data-testid="scheme-detail-contact-address"]', formatAddress(scheme.contactAddress))
  setText(doc, '[data-testid="scheme-detail-operational-plan"]', scheme.operationalPlan ?? '—')
  setText(doc, '[data-testid="scheme-detail-partners"]', scheme.partners?.map((p) => p.name).join(', ') || '—')
  setText(doc, '[data-testid="scheme-detail-offences"]', scheme.offences ?? 'None declared')
  setText(doc, '[data-testid="scheme-detail-status"]', scheme.approvalStatus ?? '—')
  setText(doc, '[data-testid="scheme-detail-agency"]', scheme.agencyCode ?? '—')
  setText(doc, '[data-testid="scheme-detail-approval-number"]', scheme.approvalNumber ?? '—')
  /* v8 ignore stop */

  if (scheme.approvalStatus === 'submitted') {
    actions.hidden = false
  } else {
    actions.hidden = true
  }

  const withdrawEl = doc.querySelector('[data-testid="scheme-detail-withdraw"]')
  if (withdrawEl) {
    if (scheme.approvalStatus === 'approved') {
      const withdrawLink = doc.querySelector('[data-testid="scheme-detail-withdraw-link"]')
      /* v8 ignore next */
      if (withdrawLink) withdrawLink.href = `/regulator/schemes/${scheme.id}/withdraw`
      withdrawEl.hidden = false
    } else {
      withdrawEl.hidden = true
    }
  }

  return 'hydrated'
}
