import { storage } from '../../../storage-adapter.js'
import { readPagePayload } from '../../../page-payload.js'

const setText = (doc, selector, text) => {
  const el = doc.querySelector(selector)
  /* v8 ignore next */
  if (el) el.textContent = text
}

/* v8 ignore start */
const formatAddress = (address) => {
  if (!address) return '—'
  return [
    address.line1,
    address.line2,
    address.line3,
    address.line4,
    address.town,
    address.postcode
  ]
    .filter(Boolean)
    .join(', ')
}

const formatSites = (sites) => {
  if (!sites || sites.length === 0) return '—'
  return sites
    .map((site) => {
      const types = []
      if (site.batteryTypes?.isPortable) types.push('Portable')
      if (site.batteryTypes?.isIndustrial) types.push('Industrial')
      if (site.batteryTypes?.isAutomotive) types.push('Automotive')
      return `${site.name} (${formatAddress(site.address)}) — ${types.join(', ')} — ${site.operationsDescription ?? ''}`
    })
    .join('; ')
}
/* v8 ignore stop */

export const runRegulatorOperatorDetail = (doc, loc) => {
  const payload = readPagePayload(doc)

  if (payload.target === 'persist') {
    if (payload.action === 'approve') {
      storage.approveOperator(payload.operatorId, payload.approvalNumber)
    } else {
      storage.rejectOperator(payload.operatorId)
    }
    loc.assign('/regulator/operators')
    return 'navigated'
  }

  const operator = storage.getOperator(payload.operatorId)
  const notFound = doc.querySelector(
    '[data-testid="operator-detail-not-found"]'
  )
  const list = doc.querySelector('[data-testid="operator-detail-list"]')
  const actions = doc.querySelector('[data-testid="operator-detail-actions"]')

  if (!operator) {
    notFound.hidden = false
    list.hidden = true
    actions.hidden = true
    return 'not-found'
  }

  notFound.hidden = true
  list.hidden = false

  /* v8 ignore start */
  setText(doc, '[data-testid="operator-detail-name"]', operator.name ?? '—')
  setText(
    doc,
    '[data-testid="operator-detail-type"]',
    (operator.approvalType ?? '').toUpperCase()
  )
  setText(
    doc,
    '[data-testid="operator-detail-company-reg"]',
    operator.companyRegistrationNo ?? '—'
  )
  setText(
    doc,
    '[data-testid="operator-detail-address"]',
    formatAddress(operator.registeredAddress)
  )
  setText(
    doc,
    '[data-testid="operator-detail-sites"]',
    formatSites(operator.sites)
  )
  setText(
    doc,
    '[data-testid="operator-detail-status"]',
    operator.approvalStatus ?? '—'
  )
  setText(
    doc,
    '[data-testid="operator-detail-agency"]',
    operator.agencyCode ?? '—'
  )
  setText(
    doc,
    '[data-testid="operator-detail-approval-number"]',
    operator.approvalNumber ?? '—'
  )
  /* v8 ignore stop */

  if (operator.approvalStatus === 'submitted') {
    actions.hidden = false
  } else {
    actions.hidden = true
  }

  const withdrawEl = doc.querySelector(
    '[data-testid="operator-detail-withdraw"]'
  )
  if (withdrawEl) {
    if (operator.approvalStatus === 'approved') {
      const withdrawLink = doc.querySelector(
        '[data-testid="operator-detail-withdraw-link"]'
      )
      /* v8 ignore next */
      if (withdrawLink) {
        withdrawLink.href = `/regulator/operators/${operator.id}/withdraw`
      }
      withdrawEl.hidden = false
    } else {
      withdrawEl.hidden = true
    }
  }

  return 'hydrated'
}
