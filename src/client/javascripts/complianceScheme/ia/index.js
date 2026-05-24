import { storage } from '../../storage-adapter.js'
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

const ensureScheme = (loc) => {
  storage.seedDemoData()
  const scheme = storage.currentScheme()
  if (!scheme) {
    loc.assign('/compliance-scheme/sign-in')
    return null
  }
  return scheme
}

/* v8 ignore next 4 */
const setText = (doc, selector, text) => {
  const el = doc.querySelector(selector)
  if (el) el.textContent = text
}

const TONNAGE_KEYS = ['placed', 'exported', 'takenBack', 'delivered']

const isMemberComplete = (member) =>
  TONNAGE_KEYS.every(
    (key) => member[key] !== null && member[key] !== undefined
  )

const memberEntryUrl = (template, memberId) =>
  template.replace('{memberId}', memberId)

const renderMemberList = (doc, submission, payload) => {
  /* v8 ignore next */
  const members = submission?.memberData ?? []
  const body = doc.querySelector('[data-testid="ia-member-list-body"]')
  const empty = doc.querySelector('[data-testid="ia-member-list-empty"]')
  const urlTemplate = payload.memberStepUrlTemplate

  if (members.length === 0) {
    body.innerHTML = ''
    empty.hidden = false
    return
  }
  empty.hidden = true

  body.innerHTML = members
    .map((m) => {
      const complete = isMemberComplete(m)
      const tag = complete
        ? '<strong class="govuk-tag">Entered</strong>'
        : '<strong class="govuk-tag govuk-tag--grey">Not entered</strong>'
      const href = memberEntryUrl(urlTemplate, m.memberId)
      const actionText = complete ? 'Edit' : 'Enter data'
      return `<tr class="govuk-table__row">
        <td class="govuk-table__cell">${escape(m.producerBprn)}</td>
        <td class="govuk-table__cell">${escape(m.companyName)}</td>
        <td class="govuk-table__cell">${tag}</td>
        <td class="govuk-table__cell"><a class="govuk-link" href="${escape(href)}">${actionText}</a></td>
      </tr>`
    })
    .join('')
}

const STEP_TO_KEY = {
  placed: 'placed',
  exported: 'exported',
  'taken-back': 'takenBack',
  delivered: 'delivered'
}

const sumMemberField = (members, dataKey, field) =>
  members.reduce(
    (total, m) => total + Number(m[dataKey]?.[field] ?? 0),
    0
  )

const renderCheckAnswers = (doc, submission, payload) => {
  const members = submission?.memberData ?? []
  const body = doc.querySelector('[data-testid="ia-check-body"]')
  const urlTemplate = payload.memberStepUrlTemplate

  body.innerHTML = members
    .map((m) => {
      const placed = m.placed ?? {}
      const exported = m.exported ?? {}
      const takenBack = m.takenBack ?? {}
      const delivered = m.delivered ?? {}
      const changeHref = memberEntryUrl(urlTemplate, m.memberId)
      return `<tr class="govuk-table__row">
        <td class="govuk-table__cell">${escape(m.companyName)}</td>
        <td class="govuk-table__cell govuk-table__cell--numeric">${escape(placed.industrial ?? '—')}</td>
        <td class="govuk-table__cell govuk-table__cell--numeric">${escape(placed.automotive ?? '—')}</td>
        <td class="govuk-table__cell govuk-table__cell--numeric">${escape(exported.industrial ?? '—')}</td>
        <td class="govuk-table__cell govuk-table__cell--numeric">${escape(exported.automotive ?? '—')}</td>
        <td class="govuk-table__cell govuk-table__cell--numeric">${escape(takenBack.industrial ?? '—')}</td>
        <td class="govuk-table__cell govuk-table__cell--numeric">${escape(takenBack.automotive ?? '—')}</td>
        <td class="govuk-table__cell govuk-table__cell--numeric">${escape(delivered.industrial ?? '—')}</td>
        <td class="govuk-table__cell govuk-table__cell--numeric">${escape(delivered.automotive ?? '—')}</td>
        <td class="govuk-table__cell"><a class="govuk-link" href="${escape(changeHref)}">Change</a></td>
      </tr>`
    })
    .join('')

  const fmt = (n) => n.toFixed(3)
  setText(doc, '[data-testid="ia-check-total-placed-industrial"]', fmt(sumMemberField(members, 'placed', 'industrial')))
  setText(doc, '[data-testid="ia-check-total-placed-automotive"]', fmt(sumMemberField(members, 'placed', 'automotive')))
  setText(doc, '[data-testid="ia-check-total-exported-industrial"]', fmt(sumMemberField(members, 'exported', 'industrial')))
  setText(doc, '[data-testid="ia-check-total-exported-automotive"]', fmt(sumMemberField(members, 'exported', 'automotive')))
  setText(doc, '[data-testid="ia-check-total-taken-back-industrial"]', fmt(sumMemberField(members, 'takenBack', 'industrial')))
  setText(doc, '[data-testid="ia-check-total-taken-back-automotive"]', fmt(sumMemberField(members, 'takenBack', 'automotive')))
  setText(doc, '[data-testid="ia-check-total-delivered-industrial"]', fmt(sumMemberField(members, 'delivered', 'industrial')))
  setText(doc, '[data-testid="ia-check-total-delivered-automotive"]', fmt(sumMemberField(members, 'delivered', 'automotive')))
}

const hydrateMemberStep = (doc, submission, payload) => {
  const member = (submission?.memberData ?? []).find(
    (m) => m.memberId === payload.memberId
  )
  if (!member) return

  const nameEl = doc.querySelector('[data-testid="ia-member-name"]')
  /* v8 ignore next */
  if (nameEl) {
    nameEl.textContent = `${member.companyName} (${member.producerBprn})`
  }

  const dataKey = STEP_TO_KEY[payload.step]
  const values = member[dataKey]
  if (values) hydrateForm(doc.querySelector('form'), values)
}

const persistMemberStep = (scheme, payload, loc) => {
  const dataKey = STEP_TO_KEY[payload.step]
  const memberPatch = { [dataKey]: payload.patch[dataKey] }

  storage.upsertIaMemberTonnage(
    scheme.id,
    payload.compliancePeriodYear,
    payload.memberId,
    memberPatch
  )

  if (payload.next) {
    loc.assign(payload.next)
    return 'navigated'
  }
  return 'persisted'
}

export const runIaStep = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  const scheme = ensureScheme(loc)
  if (!scheme) return 'redirected-to-sign-in'

  if (payload.view === 'ia-member' && payload.target === 'persist') {
    return persistMemberStep(scheme, payload, loc)
  }

  if (payload.view === 'ia-member') {
    const submission = storage.findIaSubmission(
      scheme.id,
      payload.compliancePeriodYear
    )
    hydrateMemberStep(doc, submission, payload)
    return 'hydrated'
  }

  if (payload.target === 'persist') {
    storage.upsertIaSubmission(
      scheme.id,
      payload.compliancePeriodYear,
      payload.patch
    )
    if (payload.next) {
      loc.assign(payload.next)
      return 'navigated'
    }
    return 'persisted'
  }

  const submission =
    payload.step === 'member-list'
      ? storage.initIaMemberData(scheme.id, payload.compliancePeriodYear)
      : storage.findIaSubmission(scheme.id, payload.compliancePeriodYear)

  if (payload.step === 'member-list') {
    renderMemberList(doc, submission, payload)
    return 'hydrated'
  }

  if (payload.step === 'check-answers') {
    renderCheckAnswers(doc, submission, payload)
    return 'hydrated'
  }

  if (payload.step === 'declaration') {
    const values = {
      declarationAccepted: submission?.status === 'submitted' ? 'yes' : ''
    }
    hydrateForm(doc.querySelector('form'), values)
  }

  return 'hydrated'
}
