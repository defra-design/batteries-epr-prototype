import { storage, createEvidence } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'
import { hydrateForm } from '../../hydrate-form.js'

const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

const escape = (value) =>
  String(value).replace(/[&<>"']/g, (char) => HTML_ENTITIES[char])

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

const setText = (doc, selector, text) => {
  doc.querySelector(selector).textContent = text
}

const ensureScheme = (loc) => {
  storage.seedDemoData()
  const scheme = storage.currentScheme()
  if (!scheme) {
    loc.assign('/compliance-scheme/sign-in')
    return null
  }
  return scheme
}

const ISSUE_DRAFT_KEY = 'npwd-batteries:evidence-issue-draft'

const readDraft = () => {
  const raw = globalThis.localStorage.getItem(ISSUE_DRAFT_KEY)
  return raw ? JSON.parse(raw) : {}
}

const writeDraft = (draft) => {
  globalThis.localStorage.setItem(ISSUE_DRAFT_KEY, JSON.stringify(draft))
}

const clearDraft = () => {
  globalThis.localStorage.removeItem(ISSUE_DRAFT_KEY)
}

const memberOf = (members, bprn) =>
  members.find((m) => m.producerBprn === bprn) ?? null

const renderList = (doc, payload, scheme) => {
  const schemeEvidence = storage.listEvidence(scheme.id, payload.compliancePeriodYear)
  const operatorEvidence = storage.listEvidenceForSchemeFromOperators(
    scheme.id,
    payload.compliancePeriodYear
  )
  const items = [...schemeEvidence, ...operatorEvidence]
  const body = doc.querySelector('[data-testid="evidence-body"]')
  const empty = doc.querySelector('[data-testid="evidence-empty"]')
  if (items.length === 0) {
    body.innerHTML = ''
    empty.hidden = false
    return
  }
  empty.hidden = true
  body.innerHTML = items
    .map((item) => {
      const detailHref = payload.urls.detailTemplate.replace(
        '{evidenceId}',
        item.id
      )
      const category = payload.copy.categories[item.category]
      const status = payload.copy.statuses[item.status]
      const transfer = item.transferDirection
        ? payload.copy.transferLabels[item.transferDirection]
        : ''
      const recipient = item.recipientName || item.recipientBprn
      return `<tr class="govuk-table__row" data-testid="evidence-row">
        <td class="govuk-table__cell" data-testid="evidence-row-recipient">${escape(recipient)}</td>
        <td class="govuk-table__cell" data-testid="evidence-row-category">${escape(category)}</td>
        <td class="govuk-table__cell govuk-table__cell--numeric" data-testid="evidence-row-tonnes">${escape(item.tonnes)}</td>
        <td class="govuk-table__cell" data-testid="evidence-row-status">${escape(status)}</td>
        <td class="govuk-table__cell" data-testid="evidence-row-transfer">${escape(transfer)}</td>
        <td class="govuk-table__cell"><a class="govuk-link" href="${escape(detailHref)}" data-testid="evidence-row-view">${escape(payload.copy.viewAction)}</a></td>
      </tr>`
    })
    .join('')
}

const renderRecipientRadios = (doc, scheme, payload) => {
  const radios = doc.querySelector(
    '[data-testid="evidence-issue-recipient-radios"]'
  )
  const noMembers = doc.querySelector('[data-testid="evidence-issue-no-members"]')
  const members = storage.membersForYear(
    scheme.id,
    payload.compliancePeriodYear
  ).active
  if (members.length === 0) {
    radios.innerHTML = ''
    noMembers.hidden = false
    return
  }
  noMembers.hidden = true
  const draft = readDraft()
  radios.innerHTML = members
    .map((m) => {
      const checked = draft.recipientBprn === m.producerBprn ? ' checked' : ''
      return `<div class="govuk-radios__item">
        <input class="govuk-radios__input" id="recipientBprn-${escape(m.producerBprn)}" name="recipientBprn" type="radio" value="${escape(m.producerBprn)}"${checked}>
        <label class="govuk-label govuk-radios__label" for="recipientBprn-${escape(m.producerBprn)}" data-testid="evidence-issue-recipient-option">${escape(m.companyName)} (${escape(m.producerBprn)})</label>
      </div>`
    })
    .join('')
}

const renderDeclarationSummary = (doc, scheme, payload) => {
  const draft = readDraft()
  const members = storage.membersForYear(
    scheme.id,
    payload.compliancePeriodYear
  ).active
  const recipient = memberOf(members, draft.recipientBprn)
  const recipientLabel = recipient
    ? `${recipient.companyName} (${recipient.producerBprn})`
    : draft.recipientBprn
  setText(
    doc,
    '[data-testid="evidence-issue-summary-recipient"]',
    recipientLabel
  )
  setText(
    doc,
    '[data-testid="evidence-issue-summary-category"]',
    draft.category
  )
  setText(doc, '[data-testid="evidence-issue-summary-tonnes"]', draft.tonnes)
}

const runIssueView = (doc, loc, payload, scheme) => {
  if (payload.target === 'persist') {
    if (payload.patch?.commit) {
      const draft = readDraft()
      const members = storage.membersForYear(
        scheme.id,
        payload.compliancePeriodYear
      ).active
      const recipient = memberOf(members, draft.recipientBprn)
      storage.saveEvidence(
        createEvidence({
          schemeId: scheme.id,
          compliancePeriodYear: payload.compliancePeriodYear,
          recipientBprn: draft.recipientBprn,
          recipientName: recipient?.companyName ?? null,
          category: draft.category,
          tonnes: draft.tonnes,
          status: 'awaiting-acceptance'
        })
      )
      clearDraft()
    } else {
      writeDraft({ ...readDraft(), ...payload.patch })
    }
    loc.assign(payload.next)
    return 'navigated'
  }

  if (payload.step === 'recipient') {
    renderRecipientRadios(doc, scheme, payload)
    return 'hydrated'
  }

  if (payload.step === 'tonnes') {
    const draft = readDraft()
    hydrateForm(doc.querySelector('form'), {
      category: draft.category,
      tonnes: draft.tonnes
    })
    return 'hydrated'
  }

  if (payload.step === 'declaration') {
    renderDeclarationSummary(doc, scheme, payload)
    return 'hydrated'
  }

  return 'hydrated'
}

const renderDetail = (doc, payload, scheme) => {
  const item = storage.findEvidence(payload.evidenceId)
  const notFound = doc.querySelector('[data-testid="evidence-detail-not-found"]')
  const list = doc.querySelector('[data-testid="evidence-detail-list"]')
  const actions = doc.querySelector('[data-testid="evidence-detail-buttons"]')
  const noActions = doc.querySelector('[data-testid="evidence-detail-no-actions"]')
  const isOwnEvidence = item?.schemeId === scheme.id && !item?.direction
  /* v8 ignore next 2 */
  const isOperatorEvidence =
    item?.direction === 'operator-to-scheme' && item?.schemeId === scheme.id
  /* v8 ignore next */
  if (!item || (!isOwnEvidence && !isOperatorEvidence)) {
    notFound.hidden = false
    list.hidden = true
    actions.hidden = true
    return
  }
  notFound.hidden = true
  list.hidden = false

  const recipientName = item.recipientName ?? item.recipientBprn
  setText(doc, '[data-testid="evidence-detail-recipient"]', recipientName)
  setText(doc, '[data-testid="evidence-detail-category"]', item.category)
  setText(doc, '[data-testid="evidence-detail-tonnes"]', item.tonnes)
  setText(doc, '[data-testid="evidence-detail-status"]', item.status)
  setText(
    doc,
    '[data-testid="evidence-detail-issued"]',
    formatDate(item.issuedOn)
  )
  setText(
    doc,
    '[data-testid="evidence-detail-transfer"]',
    item.transferDirection
      ? `${item.transferDirection} → ${item.counterpartySchemeId}`
      : '—'
  )

  if (item.status !== 'awaiting-acceptance') {
    actions.hidden = true
    noActions.hidden = false
  } else {
    actions.hidden = false
    noActions.hidden = true
  }
}

const runDetailView = (doc, loc, payload, scheme) => {
  if (payload.target === 'persist') {
    storage.updateEvidenceStatus(payload.evidenceId, payload.newStatus)
    loc.assign(payload.next)
    return 'navigated'
  }
  renderDetail(doc, payload, scheme)
  return 'hydrated'
}

const renderTransferCandidates = (doc, scheme) => {
  const radios = doc.querySelector('[data-testid="evidence-transfer-candidates"]')
  const empty = doc.querySelector(
    '[data-testid="evidence-transfer-no-candidates"]'
  )
  const candidates = storage
    .listSchemes()
    .filter((s) => s.id !== scheme.id)
  if (candidates.length === 0) {
    radios.innerHTML = ''
    empty.hidden = false
    return
  }
  empty.hidden = true
  radios.innerHTML = candidates
    .map(
      (s) => `<div class="govuk-radios__item">
        <input class="govuk-radios__input" id="counterpartySchemeId-${escape(s.id)}" name="counterpartySchemeId" type="radio" value="${escape(s.id)}">
        <label class="govuk-label govuk-radios__label" for="counterpartySchemeId-${escape(s.id)}" data-testid="evidence-transfer-option">${escape(s.name)}</label>
      </div>`
    )
    .join('')
}

const runTransferView = (doc, loc, payload, scheme) => {
  if (payload.target === 'persist') {
    storage.transferEvidence(payload.evidenceId, payload.counterpartySchemeId)
    loc.assign(payload.next)
    return 'navigated'
  }
  const item = storage.findEvidence(payload.evidenceId)
  const notFound = doc.querySelector('[data-testid="evidence-transfer-not-found"]')
  const ineligible = doc.querySelector(
    '[data-testid="evidence-transfer-ineligible"]'
  )
  const form = doc.querySelector('[data-testid="evidence-transfer-form"]')
  if (!item || item.schemeId !== scheme.id) {
    notFound.hidden = false
    form.hidden = true
    return 'hydrated'
  }
  if (item.transferDirection || item.status === 'cancelled') {
    ineligible.hidden = false
    form.hidden = true
    return 'hydrated'
  }
  renderTransferCandidates(doc, scheme)
  return 'hydrated'
}

const runAvailabilityView = (doc, loc, payload, scheme) => {
  if (payload.target === 'persist') {
    storage.setEvidenceAvailability(scheme.id, !scheme.evidenceAvailable)
    loc.assign(payload.next)
    return 'navigated'
  }
  setText(
    doc,
    '[data-testid="evidence-availability-current"]',
    scheme.evidenceAvailable ? 'Available' : 'Not available'
  )
  return 'hydrated'
}

export const runEvidencePage = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  const scheme = ensureScheme(loc)
  if (!scheme) return 'redirected-to-sign-in'

  if (payload.view === 'list') {
    renderList(doc, payload, scheme)
    return 'list'
  }
  if (payload.view === 'issue') return runIssueView(doc, loc, payload, scheme)
  if (payload.view === 'detail') return runDetailView(doc, loc, payload, scheme)
  if (payload.view === 'transfer') return runTransferView(doc, loc, payload, scheme)
  return runAvailabilityView(doc, loc, payload, scheme)
}

export const __testing__ = {
  ISSUE_DRAFT_KEY,
  readDraft,
  writeDraft,
  clearDraft
}
