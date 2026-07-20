import { storage } from '../storage-adapter.js'
import { readPagePayload } from '../page-payload.js'
import { buildDashboardViewModel } from './tile-builders.js'
import { buildObligation, resolveTargets } from './obligation.js'

const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

const escape = (value) =>
  String(value).replace(/[&<>"']/g, (char) => HTML_ENTITIES[char])

const setText = (doc, selector, text) => {
  doc.querySelector(selector).textContent = text
}

const setHtml = (doc, selector, html) => {
  doc.querySelector(selector).innerHTML = html
}

const link = (href, text, testId) =>
  `<a class="govuk-link" href="${escape(href)}" data-testid="${escape(testId)}">${escape(text)}</a>`

const tag = (text, classes) =>
  `<strong class="govuk-tag ${classes}">${escape(text)}</strong>`

const STATUS_TAG_CLASS = {
  'not-started': 'govuk-tag--grey',
  'in-progress': 'govuk-tag--yellow',
  submitted: 'govuk-tag--blue',
  approved: 'govuk-tag--green',
  rejected: 'govuk-tag--red',
  withdrawn: 'govuk-tag--red'
}

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

const approvalMeta = (tile) => {
  if (tile.approvalNumber && tile.approvedOn) {
    return `Approval number: ${tile.approvalNumber} · Approved on ${formatDate(tile.approvedOn)}`
  }
  if (tile.submittedOn) return `Submitted on ${formatDate(tile.submittedOn)}`
  return ''
}

const renderApproval = (doc, tile) => {
  setHtml(
    doc,
    '[data-testid="tile-approval-status"]',
    tag(tile.statusLabel, STATUS_TAG_CLASS[tile.status])
  )
  setText(doc, '[data-testid="tile-approval-meta"]', approvalMeta(tile))
  setHtml(
    doc,
    '[data-testid="tile-approval-action"]',
    link(tile.action.href, tile.action.text, 'tile-approval-link')
  )
}

const renderMembers = (doc, tile) => {
  setText(
    doc,
    '[data-testid="tile-members-count"]',
    `${tile.count} active members`
  )
  setHtml(
    doc,
    '[data-testid="tile-members-action"]',
    link(tile.manageHref, tile.manageActionText, 'tile-members-link')
  )
}

const renderEvidence = (doc, tile) => {
  setText(doc, '[data-testid="tile-evidence-accepted"]', tile.acceptedTonnes)
  setText(doc, '[data-testid="tile-evidence-awaiting"]', tile.awaitingTonnes)
  setText(
    doc,
    '[data-testid="tile-evidence-obligation"]',
    tile.obligationTonnes
  )
  setText(doc, '[data-testid="tile-evidence-delta"]', tile.deltaTonnes)
  setHtml(
    doc,
    '[data-testid="tile-evidence-action"]',
    link(tile.manageHref, tile.manageActionText, 'tile-evidence-link')
  )
  setHtml(
    doc,
    '[data-testid="tile-evidence-availability"]',
    `${escape(tile.availability.label)} · ${link(
      tile.availability.toggleHref,
      tile.availability.toggleActionText,
      'tile-evidence-availability-link'
    )}`
  )
}

const quarterItem = (q) => {
  const label = tag(q.statusLabel, STATUS_TAG_CLASS[q.status])
  const action = q.action
    ? ` · ${link(q.action.href, q.action.text, `tile-quarterly-${q.quarter}-link`)}`
    : ''
  return `<li class="govuk-body" data-testid="tile-quarterly-${q.quarter}"><strong>${q.quarter}</strong> · ${label}${action}</li>`
}

const renderQuarterly = (doc, tile) => {
  setText(
    doc,
    '[data-testid="tile-quarterly-hint"]',
    tile.gated ? tile.disabledHint : ''
  )
  setHtml(
    doc,
    '[data-testid="tile-quarterly-list"]',
    tile.quarters.map(quarterItem).join('')
  )
}

const renderIa = (doc, tile) => {
  setHtml(
    doc,
    '[data-testid="tile-ia-status"]',
    tag(tile.statusLabel, STATUS_TAG_CLASS[tile.status])
  )
  setText(
    doc,
    '[data-testid="tile-ia-hint"]',
    tile.gated ? tile.disabledHint : ''
  )
  setHtml(
    doc,
    '[data-testid="tile-ia-action"]',
    tile.action ? link(tile.action.href, tile.action.text, 'tile-ia-link') : ''
  )
}

const renderObligation = (doc, tile) => {
  setHtml(
    doc,
    '[data-testid="tile-obligation-action"]',
    link(tile.viewHref, tile.viewActionText, 'tile-obligation-link')
  )
}

const fastForwardApproval = (doc, loc, scheme) => {
  storage.saveScheme({
    ...scheme,
    approvalStatus: 'approved',
    approvalNumber: scheme.approvalNumber ?? 'BCS/DEBUG/001',
    approvedOn: new Date().toISOString(),
    submittedOn: scheme.submittedOn ?? new Date().toISOString()
  })
  doc.querySelector('[data-testid="debug-fast-forward-message"]').hidden = false
  loc.reload()
}

const attachDebugHandlers = (doc, loc, payload, scheme) => {
  if (!payload.debug.fastForwardEnabled) return
  doc
    .querySelector('[data-testid="debug-fast-forward"]')
    .addEventListener('click', () => fastForwardApproval(doc, loc, scheme))
}

export const initComplianceSchemeDashboard = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  storage.seedDemoData()
  const payload = readPagePayload(doc)
  const scheme = storage.currentScheme()
  if (!scheme) {
    loc.assign('/compliance-scheme/sign-in')
    return 'redirected-to-sign-in'
  }
  const schemeId = scheme.id

  doc.querySelector('[data-testid="app-heading-title"]').textContent =
    scheme.name

  const year = payload.compliancePeriodYear
  const activeMembers = storage.membersForYear(schemeId, year).active
  const quarterly = storage.listQuarterlySubmissions(schemeId, year)
  const evidence = storage.listEvidence(schemeId, year)
  const targets = resolveTargets(scheme.agencyCode)
  const categoryIds = storage
    .resolveCategories(scheme.agencyCode)
    .map((category) => category.id)
  const obligation = buildObligation({
    quarterly,
    evidence,
    targets,
    categoryIds
  })
  const viewModel = buildDashboardViewModel({
    scheme,
    members: activeMembers,
    quarterly,
    ia: storage.listIaSubmissions(schemeId, year),
    evidence,
    obligation,
    urls: payload.urls,
    copy: payload.copy
  })

  renderApproval(doc, viewModel.approval)
  renderMembers(doc, viewModel.members)
  renderEvidence(doc, viewModel.evidence)
  renderQuarterly(doc, viewModel.quarterly)
  renderIa(doc, viewModel.ia)
  renderObligation(doc, viewModel.obligationBreakdown)
  attachDebugHandlers(doc, loc, payload, scheme)

  return 'rendered'
}
