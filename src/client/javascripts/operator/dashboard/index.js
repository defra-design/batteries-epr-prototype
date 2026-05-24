import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'

const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

const escape = (value) =>
  /* v8 ignore next */
  String(value).replace(/[&<>"']/g, (char) => HTML_ENTITIES[char])

const setText = (doc, selector, text) => {
  doc.querySelector(selector).textContent = text
}

const setHtml = (doc, selector, html) => {
  doc.querySelector(selector).innerHTML = html
}

const tag = (text, classes) =>
  `<strong class="govuk-tag ${classes}">${escape(text)}</strong>`

const STATUS_TAG_CLASS = {
  'not-started': 'govuk-tag--grey',
  'in-progress': 'govuk-tag--yellow',
  submitted: 'govuk-tag--blue',
  approved: 'govuk-tag--green'
}

const APPROVAL_TYPE_LABELS = {
  abto: 'Approved Battery Treatment Operator',
  abe: 'Approved Battery Exporter'
}

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

const renderApproval = (doc, operator, copy) => {
  const status = operator.approvalStatus ?? 'not-started'
  setHtml(
    doc,
    '[data-testid="tile-approval-status"]',
    tag(copy.statuses[status], STATUS_TAG_CLASS[status])
  )
  setText(
    doc,
    '[data-testid="tile-approval-type"]',
    APPROVAL_TYPE_LABELS[operator.approvalType] ?? operator.approvalType
  )

  const meta = []
  if (operator.approvalNumber) meta.push(operator.approvalNumber)
  if (operator.approvedOn) meta.push(`Approved ${formatDate(operator.approvedOn)}`)
  setText(doc, '[data-testid="tile-approval-meta"]', meta.join(' · '))
}

const renderEvidence = (doc, copy) => {
  setText(doc, '[data-testid="tile-evidence-summary"]', copy.issueAction)
}

const renderQuarterly = (doc, operator, copy) => {
  const isGated = operator.approvalStatus !== 'approved'
  const hasPortable = operator.batteryTypes?.isPortable
  const container = doc.querySelector('[data-testid="tile-quarterly-container"]')
  if (!hasPortable && container) {
    container.hidden = true
    return
  }
  setText(
    doc,
    '[data-testid="tile-quarterly-hint"]',
    isGated ? copy.disabledHint : ''
  )
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4']
  const items = quarters
    .map(
      (q) =>
        `<li class="govuk-body" data-testid="tile-quarterly-${q}"><strong>${q}</strong> · ${tag(copy.statuses['not-started'], STATUS_TAG_CLASS['not-started'])}</li>`
    )
    .join('')
  setHtml(doc, '[data-testid="tile-quarterly-list"]', items)
}

const renderAnnual = (doc, operator, copy) => {
  const isGated = operator.approvalStatus !== 'approved'
  const hasIndAuto =
    operator.batteryTypes?.isIndustrial || operator.batteryTypes?.isAutomotive
  const container = doc.querySelector('[data-testid="tile-annual-container"]')
  if (!hasIndAuto && container) {
    container.hidden = true
    return
  }
  setHtml(
    doc,
    '[data-testid="tile-annual-status"]',
    tag('Not started', STATUS_TAG_CLASS['not-started'])
  )
  setText(
    doc,
    '[data-testid="tile-annual-hint"]',
    isGated ? copy.disabledHint : ''
  )
}

const fastForwardApproval = (doc, loc, operator) => {
  storage.saveOperator({
    ...operator,
    approvalStatus: 'approved',
    approvalNumber:
      operator.approvalNumber ??
      `${operator.approvalType === 'abe' ? 'ABE' : 'ABTO'}/DEBUG/001`,
    approvedOn: new Date().toISOString(),
    submittedOn: operator.submittedOn ?? new Date().toISOString()
  })
  doc.querySelector('[data-testid="debug-fast-forward-message"]').hidden = false
  loc.reload()
}

const attachDebugHandlers = (doc, loc, payload, operator) => {
  if (!payload.debug.fastForwardEnabled) return
  doc
    .querySelector('[data-testid="debug-fast-forward"]')
    .addEventListener('click', () => fastForwardApproval(doc, loc, operator))
}

export const initOperatorDashboard = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  storage.seedDemoData()
  const payload = readPagePayload(doc)
  const operator = storage.currentOperator()
  if (!operator) {
    loc.assign('/operator/sign-in')
    return 'redirected-to-sign-in'
  }

  doc.querySelector('[data-testid="app-heading-title"]').textContent =
    operator.name

  renderApproval(doc, operator, payload.copy.approval)
  renderEvidence(doc, payload.copy.evidence)
  renderQuarterly(doc, operator, payload.copy.quarterly)
  renderAnnual(doc, operator, payload.copy.annual)
  attachDebugHandlers(doc, loc, payload, operator)

  return 'rendered'
}
