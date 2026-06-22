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
  /* v8 ignore next */
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

const ensureOperator = (loc) => {
  storage.seedDemoData()
  const operator = storage.currentOperator()
  if (!operator) {
    loc.assign('/operator/sign-in')
    return null
  }
  return operator
}

const ISSUE_DRAFT_KEY = 'npwd-batteries:operator-evidence-issue-draft'

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

const renderList = (doc, payload, operator) => {
  const items = storage.listEvidenceByOperator(
    operator.id,
    payload.compliancePeriodYear
  )
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
      /* v8 ignore next */
      const category = payload.copy.categories[item.category] ?? item.category
      /* v8 ignore next */
      const status = payload.copy.statuses[item.status] ?? item.status
      const schemeName =
        /* v8 ignore next */
        storage.getScheme(item.schemeId)?.name ?? item.schemeId
      return `<tr class="govuk-table__row" data-testid="evidence-row">
        <td class="govuk-table__cell" data-testid="evidence-row-scheme">${escape(schemeName)}</td>
        <td class="govuk-table__cell" data-testid="evidence-row-category">${escape(category)}</td>
        <td class="govuk-table__cell govuk-table__cell--numeric" data-testid="evidence-row-tonnes">${escape(item.tonnes)}</td>
        <td class="govuk-table__cell" data-testid="evidence-row-status">${escape(status)}</td>
        <td class="govuk-table__cell"><a class="govuk-link" href="${escape(detailHref)}" data-testid="evidence-row-view">${escape(payload.copy.viewAction)}</a></td>
      </tr>`
    })
    .join('')
}

const renderSchemeRadios = (doc, payload) => {
  const radios = doc.querySelector(
    '[data-testid="evidence-issue-scheme-radios"]'
  )
  const noSchemes = doc.querySelector(
    '[data-testid="evidence-issue-no-schemes"]'
  )
  const schemes = storage.getSchemes({ status: 'approved' })
  if (schemes.length === 0) {
    radios.innerHTML = ''
    noSchemes.hidden = false
    return
  }
  noSchemes.hidden = true
  const draft = readDraft()
  radios.innerHTML = schemes
    .map((s) => {
      /* v8 ignore next */
      const checked = draft.schemeId === s.id ? ' checked' : ''
      return `<div class="govuk-radios__item">
        <input class="govuk-radios__input" id="schemeId-${escape(s.id)}" name="schemeId" type="radio" value="${escape(s.id)}"${checked}>
        <label class="govuk-label govuk-radios__label" for="schemeId-${escape(s.id)}" data-testid="evidence-issue-scheme-option">${escape(s.name)}</label>
      </div>`
    })
    .join('')
}

const renderDeclarationSummary = (doc) => {
  const draft = readDraft()
  const scheme = draft.schemeId ? storage.getScheme(draft.schemeId) : null
  setText(
    doc,
    '[data-testid="evidence-issue-summary-scheme"]',
    scheme?.name ?? draft.schemeId ?? ''
  )
  setText(
    doc,
    '[data-testid="evidence-issue-summary-category"]',
    draft.category ?? ''
  )
  setText(
    doc,
    '[data-testid="evidence-issue-summary-tonnes"]',
    draft.tonnes ?? ''
  )
  const dateRange =
    draft.wasteReceivedFrom && draft.wasteReceivedTo
      ? `${draft.wasteReceivedFrom} to ${draft.wasteReceivedTo}`
      : ''
  setText(doc, '[data-testid="evidence-issue-summary-dates"]', dateRange)
}

const runIssueView = (doc, loc, payload, operator) => {
  if (payload.target === 'persist') {
    if (payload.patch?.commit) {
      const draft = readDraft()
      /* v8 ignore next */
      const scheme = draft.schemeId ? storage.getScheme(draft.schemeId) : null
      storage.saveEvidence(
        createEvidence({
          schemeId: draft.schemeId,
          compliancePeriodYear: payload.compliancePeriodYear,
          recipientBprn: null,
          /* v8 ignore next */
          recipientName: scheme?.name ?? null,
          category: draft.category,
          tonnes: draft.tonnes,
          status: 'awaiting-acceptance',
          issuedByOperatorId: operator.id,
          issuedByApprovalNumber: operator.approvalNumber,
          /* v8 ignore next */
          issuedBySiteName: operator.sites?.[0]?.name ?? null,
          wasteReceivedFrom: draft.wasteReceivedFrom,
          wasteReceivedTo: draft.wasteReceivedTo,
          direction: 'operator-to-scheme'
        })
      )
      clearDraft()
    } else {
      writeDraft({ ...readDraft(), ...payload.patch })
    }
    loc.assign(payload.next)
    return 'navigated'
  }

  if (payload.step === 'scheme') {
    renderSchemeRadios(doc, payload)
    return 'hydrated'
  }

  if (payload.step === 'tonnage') {
    const draft = readDraft()
    hydrateForm(doc.querySelector('form'), {
      category: draft.category,
      tonnes: draft.tonnes,
      wasteReceivedFrom: draft.wasteReceivedFrom,
      wasteReceivedTo: draft.wasteReceivedTo
    })
    return 'hydrated'
  }

  if (payload.step === 'declaration') {
    renderDeclarationSummary(doc)
    return 'hydrated'
  }

  return 'hydrated'
}

const renderDetail = (doc, payload, operator) => {
  const item = storage.findEvidence(payload.evidenceId)
  const notFound = doc.querySelector(
    '[data-testid="evidence-detail-not-found"]'
  )
  const list = doc.querySelector('[data-testid="evidence-detail-list"]')
  if (!item || item.issuedByOperatorId !== operator.id) {
    notFound.hidden = false
    list.hidden = true
    return
  }
  notFound.hidden = true
  list.hidden = false

  const scheme = storage.getScheme(item.schemeId)
  setText(
    doc,
    '[data-testid="evidence-detail-scheme"]',
    /* v8 ignore next */
    scheme?.name ?? item.schemeId
  )
  setText(doc, '[data-testid="evidence-detail-category"]', item.category)
  setText(doc, '[data-testid="evidence-detail-tonnes"]', item.tonnes)
  setText(doc, '[data-testid="evidence-detail-status"]', item.status)
  setText(
    doc,
    '[data-testid="evidence-detail-issued"]',
    formatDate(item.issuedOn)
  )
  const dateRange =
    item.wasteReceivedFrom && item.wasteReceivedTo
      ? `${item.wasteReceivedFrom} to ${item.wasteReceivedTo}`
      : '—'
  setText(doc, '[data-testid="evidence-detail-dates"]', dateRange)
}

const runDetailView = (doc, payload, operator) => {
  renderDetail(doc, payload, operator)
  return 'hydrated'
}

export const runOperatorEvidencePage = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  const operator = ensureOperator(loc)
  if (!operator) return 'redirected-to-sign-in'

  if (payload.view === 'list') {
    renderList(doc, payload, operator)
    return 'list'
  }
  if (payload.view === 'issue') return runIssueView(doc, loc, payload, operator)
  if (payload.view === 'detail') return runDetailView(doc, payload, operator)
  return 'hydrated'
}

export const __testing__ = {
  ISSUE_DRAFT_KEY,
  readDraft,
  writeDraft,
  clearDraft
}
