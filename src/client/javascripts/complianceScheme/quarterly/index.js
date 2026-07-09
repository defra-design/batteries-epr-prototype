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

const hasData = (obj) => obj !== null && obj !== undefined

const memberMarketUrl = (template, memberId) =>
  template.replace('{memberId}', memberId).replace('{dataType}', 'market-data')

const renderMemberList = (doc, submission, payload) => {
  /* v8 ignore next */
  const members = submission?.memberData ?? []
  const body = doc.querySelector('[data-testid="quarterly-member-list-body"]')
  const empty = doc.querySelector('[data-testid="quarterly-member-list-empty"]')
  const urlTemplate = payload.memberStepUrlTemplate

  if (members.length === 0) {
    body.innerHTML = ''
    empty.hidden = false
    return
  }
  empty.hidden = true

  body.innerHTML = members
    .map((m) => {
      const marketEntered = hasData(m.marketData)
      const wasteEntered = hasData(m.wasteData)
      const marketTag = marketEntered
        ? '<strong class="govuk-tag">Entered</strong>'
        : '<strong class="govuk-tag govuk-tag--grey">Not entered</strong>'
      const wasteTag = wasteEntered
        ? '<strong class="govuk-tag">Entered</strong>'
        : '<strong class="govuk-tag govuk-tag--grey">Not entered</strong>'
      const marketHref = memberMarketUrl(urlTemplate, m.memberId)
      const actionText = marketEntered && wasteEntered ? 'Edit' : 'Enter data'
      return `<tr class="govuk-table__row">
        <td class="govuk-table__cell">${escape(m.producerBprn)}</td>
        <td class="govuk-table__cell">${escape(m.companyName)}</td>
        <td class="govuk-table__cell">${marketTag}</td>
        <td class="govuk-table__cell">${wasteTag}</td>
        <td class="govuk-table__cell"><a class="govuk-link" href="${escape(marketHref)}">${actionText}</a></td>
      </tr>`
    })
    .join('')
}

const sumMemberField = (members, dataKey, field) =>
  members.reduce((total, m) => total + Number(m[dataKey]?.[field] ?? 0), 0)

const renderCheckAnswers = (doc, submission, payload) => {
  const members = submission?.memberData ?? []
  const body = doc.querySelector('[data-testid="quarterly-check-body"]')
  const urlTemplate = payload.memberStepUrlTemplate

  body.innerHTML = members
    .map((m) => {
      const market = m.marketData ?? {}
      const waste = m.wasteData ?? {}
      const changeHref = memberMarketUrl(urlTemplate, m.memberId)
      return `<tr class="govuk-table__row">
        <td class="govuk-table__cell">${escape(m.companyName)}</td>
        <td class="govuk-table__cell govuk-table__cell--numeric">${escape(market.portable ?? '—')}</td>
        <td class="govuk-table__cell govuk-table__cell--numeric">${escape(market.industrial ?? '—')}</td>
        <td class="govuk-table__cell govuk-table__cell--numeric">${escape(market.automotive ?? '—')}</td>
        <td class="govuk-table__cell govuk-table__cell--numeric">${escape(waste.portable ?? '—')}</td>
        <td class="govuk-table__cell govuk-table__cell--numeric">${escape(waste.industrial ?? '—')}</td>
        <td class="govuk-table__cell govuk-table__cell--numeric">${escape(waste.automotive ?? '—')}</td>
        <td class="govuk-table__cell"><a class="govuk-link" href="${escape(changeHref)}">Change</a></td>
      </tr>`
    })
    .join('')

  const fmt = (n) => n.toFixed(3)
  setText(
    doc,
    '[data-testid="quarterly-check-total-market-portable"]',
    fmt(sumMemberField(members, 'marketData', 'portable'))
  )
  setText(
    doc,
    '[data-testid="quarterly-check-total-market-industrial"]',
    fmt(sumMemberField(members, 'marketData', 'industrial'))
  )
  setText(
    doc,
    '[data-testid="quarterly-check-total-market-automotive"]',
    fmt(sumMemberField(members, 'marketData', 'automotive'))
  )
  setText(
    doc,
    '[data-testid="quarterly-check-total-waste-portable"]',
    fmt(sumMemberField(members, 'wasteData', 'portable'))
  )
  setText(
    doc,
    '[data-testid="quarterly-check-total-waste-industrial"]',
    fmt(sumMemberField(members, 'wasteData', 'industrial'))
  )
  setText(
    doc,
    '[data-testid="quarterly-check-total-waste-automotive"]',
    fmt(sumMemberField(members, 'wasteData', 'automotive'))
  )
}

const hydrateMemberStep = (doc, submission, payload) => {
  const member = (submission?.memberData ?? []).find(
    (m) => m.memberId === payload.memberId
  )
  if (!member) return

  const nameEl = doc.querySelector('[data-testid="quarterly-member-name"]')
  /* v8 ignore next */
  if (nameEl) {
    nameEl.textContent = `${member.companyName} (${member.producerBprn})`
  }

  const dataKey =
    payload.dataType === 'market-data' ? 'marketData' : 'wasteData'
  const values = member[dataKey]
  if (values) hydrateForm(doc.querySelector('form'), values)
}

const persistMemberStep = (scheme, payload, loc) => {
  const dataKey =
    payload.dataType === 'market-data' ? 'marketData' : 'wasteData'
  const memberPatch = { [dataKey]: payload.patch[dataKey] }

  storage.upsertQuarterlyMemberTonnage(
    scheme.id,
    payload.compliancePeriodYear,
    payload.quarter,
    payload.memberId,
    memberPatch
  )

  if (payload.dataType === 'market-data') {
    const wasteUrl = payload.next.replace(
      'member-list',
      `member/${payload.memberId}/waste-data`
    )
    loc.assign(wasteUrl)
    return 'navigated'
  }

  loc.assign(payload.next)
  return 'navigated'
}

export const runQuarterlyStep = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  const scheme = ensureScheme(loc)
  if (!scheme) return 'redirected-to-sign-in'

  if (payload.view === 'quarterly-member' && payload.target === 'persist') {
    return persistMemberStep(scheme, payload, loc)
  }

  if (payload.view === 'quarterly-member') {
    const submission = storage.findQuarterlySubmission(
      scheme.id,
      payload.compliancePeriodYear,
      payload.quarter
    )
    hydrateMemberStep(doc, submission, payload)
    return 'hydrated'
  }

  if (payload.target === 'persist') {
    storage.upsertQuarterlySubmission(
      scheme.id,
      payload.compliancePeriodYear,
      payload.quarter,
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
      ? storage.initQuarterlyMemberData(
          scheme.id,
          payload.compliancePeriodYear,
          payload.quarter
        )
      : storage.findQuarterlySubmission(
          scheme.id,
          payload.compliancePeriodYear,
          payload.quarter
        )

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
