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

const approvalAction = (status, urls, copy) => {
  if (status === 'not-started') {
    return { text: copy.startAction, href: urls.applicationStart }
  }
  if (status === 'in-progress') {
    return { text: copy.continueAction, href: urls.applicationStart }
  }
  return { text: copy.viewAction, href: urls.applicationCheckAnswers }
}

const link = (href, text, testId) =>
  `<a class="govuk-link" href="${escape(href)}" data-testid="${escape(testId)}">${escape(text)}</a>`

const renderApproval = (doc, operator, copy, urls) => {
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

  const action = approvalAction(status, urls, copy)
  setHtml(
    doc,
    '[data-testid="tile-approval-action"]',
    link(action.href, action.text, 'tile-approval-link')
  )
}

const renderEvidence = (doc, operator, year, copy, urls) => {
  const items = storage.listEvidenceByOperator(operator.id, year)
  const isGated = operator.approvalStatus !== 'approved'
  const totalTonnes = items.reduce(
    /* v8 ignore next */
    (sum, e) => sum + (Number(e.tonnes) || 0),
    0
  )
  const summaryParts = [
    `${items.length} BEN${items.length === 1 ? '' : 's'} issued`,
    `${totalTonnes.toFixed(3)} tonnes`
  ]
  setText(doc, '[data-testid="tile-evidence-summary"]', summaryParts.join(' · '))
  const actionEl = doc.querySelector('[data-testid="tile-evidence-action"]')
  if (actionEl) {
    if (isGated) {
      actionEl.innerHTML = ''
    } else {
      actionEl.innerHTML =
        link(urls.evidence, copy.manageAction, 'tile-evidence-link') +
        ' · ' +
        link(urls.evidenceIssue, copy.issueAction, 'tile-evidence-issue-link')
    }
  }
}

const quarterlyStepUrl = (urlTemplate, quarter, step) =>
  urlTemplate.replace('{quarter}', quarter).replace('{step}', step)

const quarterlyActionForStatus = (status, copy, urlTemplate, quarter) => {
  const href = quarterlyStepUrl(urlTemplate, quarter, 'tonnages')
  if (status === 'submitted') {
    return link(href, copy.viewAction, `tile-quarterly-${quarter}-link`)
  }
  if (status === 'in-progress') {
    return link(href, copy.continueAction, `tile-quarterly-${quarter}-link`)
  }
  return link(href, copy.startAction, `tile-quarterly-${quarter}-link`)
}

const renderQuarterly = (doc, operator, year, copy, urls) => {
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
  const returns = storage.listOperatorQuarterlyReturns(operator.id, year)
  const urlTemplate = urls.quarterly
  const items = quarters
    .map((q) => {
      const existing = returns.find((r) => r.quarter === q)
      const status = existing?.status ?? 'not-started'
      const statusTag = tag(copy.statuses[status], STATUS_TAG_CLASS[status])
      const action = isGated
        ? ''
        : ` · ${quarterlyActionForStatus(status, copy, urlTemplate, q)}`
      return `<li class="govuk-body" data-testid="tile-quarterly-${q}"><strong>${q}</strong> · ${statusTag}${action}</li>`
    })
    .join('')
  setHtml(doc, '[data-testid="tile-quarterly-list"]', items)
}

const annualActionForStatus = (status, copy, urls) => {
  const tonnagesUrl = urls.annualReturn.replace('{step}', 'tonnages')
  const declarationUrl = urls.annualReturn.replace('{step}', 'declaration')
  if (status === 'not-started') {
    return link(tonnagesUrl, copy.startAction, 'tile-annual-link')
  }
  if (status === 'in-progress') {
    return link(tonnagesUrl, copy.continueAction, 'tile-annual-link')
  }
  return link(declarationUrl, copy.viewAction, 'tile-annual-link')
}

const renderAnnual = (doc, operator, year, copy, urls) => {
  const isGated = operator.approvalStatus !== 'approved'
  const hasIndAuto =
    operator.batteryTypes?.isIndustrial || operator.batteryTypes?.isAutomotive
  const container = doc.querySelector('[data-testid="tile-annual-container"]')
  if (!hasIndAuto && container) {
    container.hidden = true
    return
  }
  const existing = storage.findOperatorAnnualReturn(operator.id, year)
  const status = existing?.status ?? 'not-started'
  setHtml(
    doc,
    '[data-testid="tile-annual-status"]',
    /* v8 ignore next */
    tag(copy.statuses?.[status] ?? status, STATUS_TAG_CLASS[status] ?? STATUS_TAG_CLASS['not-started'])
  )
  setText(
    doc,
    '[data-testid="tile-annual-hint"]',
    isGated ? copy.disabledHint : ''
  )
  const actionEl = doc.querySelector('[data-testid="tile-annual-action"]')
  if (actionEl && !isGated) {
    actionEl.innerHTML = annualActionForStatus(status, copy, urls)
  }
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

  const year = payload.compliancePeriodYear
  renderApproval(doc, operator, payload.copy.approval, payload.urls)
  renderEvidence(doc, operator, year, payload.copy.evidence, payload.urls)
  renderQuarterly(doc, operator, year, payload.copy.quarterly, payload.urls)
  renderAnnual(doc, operator, year, payload.copy.annual, payload.urls)
  attachDebugHandlers(doc, loc, payload, operator)

  return 'rendered'
}
