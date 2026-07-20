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

const renderCheckAnswers = (doc, submission, payload, categories) => {
  const members = submission?.memberData ?? []
  const urlTemplate = payload.memberStepUrlTemplate

  const headerCells = (prefix) =>
    categories
      .map(
        (category) =>
          `<th scope="col" class="govuk-table__header govuk-table__header--numeric">${prefix}: ${escape(category.shortLabel)}</th>`
      )
      .join('')

  doc.querySelector('[data-testid="quarterly-check-head"]').innerHTML =
    `<tr class="govuk-table__row">` +
    `<th scope="col" class="govuk-table__header">Member</th>` +
    headerCells('Market') +
    headerCells('Waste') +
    `<th scope="col" class="govuk-table__header">Change</th>` +
    `</tr>`

  const numericCells = (data) =>
    categories
      .map(
        (category) =>
          `<td class="govuk-table__cell govuk-table__cell--numeric">${escape(data[category.id] ?? '—')}</td>`
      )
      .join('')

  doc.querySelector('[data-testid="quarterly-check-body"]').innerHTML = members
    .map((m) => {
      const market = m.marketData ?? {}
      const waste = m.wasteData ?? {}
      const changeHref = memberMarketUrl(urlTemplate, m.memberId)
      return `<tr class="govuk-table__row">
        <td class="govuk-table__cell">${escape(m.companyName)}</td>
        ${numericCells(market)}
        ${numericCells(waste)}
        <td class="govuk-table__cell"><a class="govuk-link" href="${escape(changeHref)}">Change</a></td>
      </tr>`
    })
    .join('')

  const fmt = (n) => n.toFixed(3)
  const totalCells = (kind, dataKey) =>
    categories
      .map(
        (category) =>
          `<td class="govuk-table__cell govuk-table__cell--numeric" data-testid="quarterly-check-total-${kind}-${category.id}">${fmt(sumMemberField(members, dataKey, category.id))}</td>`
      )
      .join('')

  doc.querySelector('[data-testid="quarterly-check-foot"]').innerHTML =
    `<tr class="govuk-table__row" data-testid="quarterly-check-totals">` +
    `<th scope="row" class="govuk-table__header">Totals</th>` +
    totalCells('market', 'marketData') +
    totalCells('waste', 'wasteData') +
    `<td class="govuk-table__cell"></td>` +
    `</tr>`
}

const tonneFieldMarkup = (category, hint, error) => {
  const groupClass = error
    ? 'govuk-form-group govuk-form-group--error'
    : 'govuk-form-group'
  const inputClass = error
    ? 'govuk-input govuk-input--width-10 govuk-input--error'
    : 'govuk-input govuk-input--width-10'
  const errorHtml = error
    ? `<p class="govuk-error-message" data-testid="tonnes-error-${escape(category.id)}">${escape(error)}</p>`
    : ''
  return `<div class="${groupClass}">
    <label class="govuk-label" for="${escape(category.id)}">${escape(category.label)}</label>
    <div class="govuk-hint">${escape(hint)}</div>
    ${errorHtml}
    <input class="${inputClass}" id="${escape(category.id)}" name="${escape(category.id)}" data-testid="tonnes-${escape(category.id)}" />
  </div>`
}

const hydrateMemberStep = (doc, submission, payload, categories) => {
  const member = (submission?.memberData ?? []).find(
    (m) => m.memberId === payload.memberId
  )
  if (!member) return

  const nameEl = doc.querySelector('[data-testid="quarterly-member-name"]')
  /* v8 ignore next */
  if (nameEl) {
    nameEl.textContent = `${member.companyName} (${member.producerBprn})`
  }

  const fieldErrors = payload.fieldErrors ?? {}
  const form = doc.querySelector('form')
  doc.querySelector('[data-testid="category-fields"]').innerHTML = categories
    .map((category) =>
      tonneFieldMarkup(category, payload.fieldHint, fieldErrors[category.id])
    )
    .join('')

  const hidden = doc.createElement('input')
  hidden.type = 'hidden'
  hidden.name = 'categoryIds'
  hidden.value = categories.map((category) => category.id).join(',')
  form.appendChild(hidden)

  const dataKey =
    payload.dataType === 'market-data' ? 'marketData' : 'wasteData'
  const values = member[dataKey]
  if (values) hydrateForm(form, values)
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

  const categories = storage.resolveCategories(scheme.agencyCode)

  if (payload.view === 'quarterly-member' && payload.target === 'persist') {
    return persistMemberStep(scheme, payload, loc)
  }

  if (payload.view === 'quarterly-member') {
    const submission = storage.findQuarterlySubmission(
      scheme.id,
      payload.compliancePeriodYear,
      payload.quarter
    )
    hydrateMemberStep(doc, submission, payload, categories)
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
    renderCheckAnswers(doc, submission, payload, categories)
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
