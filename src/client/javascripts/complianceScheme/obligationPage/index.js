import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'
import { buildObligationSnapshot } from '../obligation.js'
import { QUARTERS } from '../tile-builders.js'

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

const setOptionalText = (doc, selector, text) => {
  const node = doc.querySelector(selector)
  if (node) node.textContent = text
}

const setAll = (doc, selector, text) => {
  for (const node of doc.querySelectorAll(selector)) {
    node.textContent = text
  }
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

const fmt = (value) => value.toFixed(3)

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

const setHidden = (doc, selector, hidden) => {
  const node = doc.querySelector(selector)
  if (node) node.hidden = hidden
}

const showResults = (doc) => {
  setHidden(doc, '[data-testid="obligation-empty"]', true)
  setHidden(doc, '[data-testid="obligation-results"]', false)
}

const showEmptyState = (doc) => {
  setHidden(doc, '[data-testid="obligation-empty"]', false)
  setHidden(doc, '[data-testid="obligation-results"]', true)
}

const categoryLabeller = (snapshot, copy) => (id) =>
  snapshot.categoryLabels?.[id] ?? copy.categories[id] ?? id

const renderCertificate = (doc, snapshot, labelFor) => {
  setOptionalText(
    doc,
    '[data-testid="obligation-certificate-calculated-at"]',
    formatDateTime(snapshot.calculatedAt)
  )
  setOptionalText(
    doc,
    '[data-testid="obligation-certificate-rule-version"]',
    snapshot.rules.version
  )
  setOptionalText(
    doc,
    '[data-testid="obligation-certificate-config"]',
    `${snapshot.rules.configSource} ${snapshot.rules.configVersion}`
  )
  const targets = doc.querySelector(
    '[data-testid="obligation-certificate-targets"]'
  )
  if (!targets) return
  targets.innerHTML = snapshot.batteryCategories
    .map(
      (category) =>
        `<li class="govuk-body">${escape(labelFor(category))}: collection ${snapshot.targets.collection[category]}%, recycling ${snapshot.targets.recycling[category]}%</li>`
    )
    .join('')
}

const formulaTypes = (copy) => [
  {
    key: 'collection',
    heading: copy.formula.collectionHeading,
    targetTerm: copy.formula.collectionTargetTerm,
    resultLabel: copy.formula.collectionResultLabel
  },
  {
    key: 'recycling',
    heading: copy.formula.recyclingHeading,
    targetTerm: copy.formula.recyclingTargetTerm,
    resultLabel: copy.formula.recyclingResultLabel
  }
]

const calcTypeMarkup = (category, type, copy) => {
  const placed = `<span data-testid="obligation-calc-${escape(category)}-${type.key}-placed">0.000</span>`
  const target = `<span data-testid="obligation-calc-${escape(category)}-${type.key}-target">0</span>`
  const unit = escape(copy.formula.tonnesUnit)
  return `<h3 class="govuk-heading-s">${escape(type.heading)}</h3>
    <p class="govuk-body"><strong>${escape(copy.formulaEquation)}</strong></p>
    <ul class="govuk-list govuk-list--bullet">
      <li><strong>X</strong> is ${placed} ${unit} (${escape(copy.formula.placedTerm)})</li>
      <li><strong>Y</strong> is ${target}% (${escape(type.targetTerm)})</li>
    </ul>
    <p class="govuk-body">
      ${escape(type.resultLabel)}<br>
      <strong>
        ${placed} ${unit} × ${target}% =
        <span data-testid="obligation-calc-${escape(category)}-${type.key}-obligation">0.000</span>
        ${unit}
      </strong>
    </p>`
}

const calcDetailsMarkup = (category, label, copy) =>
  `<details class="govuk-details" data-testid="obligation-calc-${escape(category)}">
    <summary class="govuk-details__summary">
      <span class="govuk-details__summary-text">${escape(label)}</span>
    </summary>
    <div class="govuk-details__text">
      ${formulaTypes(copy)
        .map((type) => calcTypeMarkup(category, type, copy))
        .join('')}
    </div>
  </details>`

const renderCalcDetails = (doc, snapshot, copy, labelFor) => {
  const list = doc.querySelector('[data-testid="obligation-calc-list"]')
  if (!list) return
  list.innerHTML = snapshot.batteryCategories
    .map((category) => calcDetailsMarkup(category, labelFor(category), copy))
    .join('')
}

const setCalcFigures = (doc, row) => {
  const formulas = {
    collection: {
      targetPercent: row.collectionTargetPercent,
      obligation: row.collectionObligation
    },
    recycling: {
      targetPercent: row.targetPercent,
      obligation: row.obligation
    }
  }
  for (const [type, { targetPercent, obligation }] of Object.entries(
    formulas
  )) {
    const prefix = `[data-testid="obligation-calc-${row.category}-${type}`
    setAll(doc, `${prefix}-placed"]`, fmt(row.placed))
    setAll(doc, `${prefix}-target"]`, String(targetPercent))
    setAll(doc, `${prefix}-obligation"]`, fmt(obligation))
  }
}

const renderSnapshot = (doc, snapshot, copy) => {
  const { rows, totals } = snapshot
  const labelFor = categoryLabeller(snapshot, copy)
  renderCertificate(doc, snapshot, labelFor)
  renderCalcDetails(doc, snapshot, copy, labelFor)

  const body = doc.querySelector('[data-testid="obligation-body"]')
  body.innerHTML = rows
    .map(
      (row) =>
        `<tr class="govuk-table__row" data-testid="obligation-row-${row.category}">
          <th scope="row" class="govuk-table__header">${escape(labelFor(row.category))}</th>
          <td class="govuk-table__cell govuk-table__cell--numeric" data-testid="obligation-row-${row.category}-placed">${fmt(row.placed)}</td>
          <td class="govuk-table__cell govuk-table__cell--numeric">${row.targetPercent}%</td>
          <td class="govuk-table__cell govuk-table__cell--numeric" data-testid="obligation-row-${row.category}-obligation">${fmt(row.obligation)}</td>
          <td class="govuk-table__cell govuk-table__cell--numeric" data-testid="obligation-row-${row.category}-accepted">${fmt(row.accepted)}</td>
          <td class="govuk-table__cell govuk-table__cell--numeric" data-testid="obligation-row-${row.category}-outstanding">${fmt(row.outstanding)}</td>
        </tr>`
    )
    .join('')

  for (const row of rows) {
    setCalcFigures(doc, row)
  }

  setText(doc, '[data-testid="obligation-total-placed"]', fmt(totals.placed))
  setText(
    doc,
    '[data-testid="obligation-total-obligation"]',
    fmt(totals.obligation)
  )
  setText(
    doc,
    '[data-testid="obligation-total-accepted"]',
    fmt(totals.accepted)
  )
  setText(
    doc,
    '[data-testid="obligation-total-outstanding"]',
    fmt(totals.outstanding)
  )
}

const renderPrevious = (doc, snapshots) => {
  const list = doc.querySelector('[data-testid="obligation-previous-list"]')
  if (!list) return
  list.innerHTML = snapshots
    .map(
      (snapshot) =>
        `<tr class="govuk-table__row" data-testid="obligation-previous-item">
          <td class="govuk-table__cell">${escape(snapshot.compliancePeriodYear)}</td>
          <td class="govuk-table__cell">${escape(formatDateTime(snapshot.calculatedAt))}</td>
          <td class="govuk-table__cell govuk-table__cell--numeric">${fmt(snapshot.totals.obligation)}</td>
          <td class="govuk-table__cell">${escape(snapshot.rules.version)}</td>
        </tr>`
    )
    .join('')
  setHidden(doc, '[data-testid="obligation-previous"]', snapshots.length === 0)
}

const allQuartersSubmitted = (scheme, year) => {
  const submissions = storage.listQuarterlySubmissions(scheme.id, year)
  return QUARTERS.every((quarter) =>
    submissions.some((s) => s.quarter === quarter && s.status === 'submitted')
  )
}

// Once an obligation is calculated for a year it is final, so the button is
// hidden whenever a snapshot already exists for the current compliance period.
const submittedCategoryIds = (submission) => {
  if (Array.isArray(submission.categoryIds)) return submission.categoryIds
  const ids = new Set()
  for (const member of submission.memberData ?? []) {
    for (const key of Object.keys(member.marketData ?? {})) ids.add(key)
    for (const key of Object.keys(member.wasteData ?? {})) ids.add(key)
  }
  return [...ids]
}

const sameIdSet = (a, b) =>
  a.length === b.length && a.every((id) => b.includes(id))

const divergedQuarters = (scheme, year) => {
  const currentIds = storage
    .resolveCategories(scheme.agencyCode)
    .map((category) => category.id)
  const submissions = storage.listQuarterlySubmissions(scheme.id, year)
  return QUARTERS.filter((quarter) => {
    const submission = submissions.find(
      (item) => item.quarter === quarter && item.status === 'submitted'
    )
    if (!submission) return false
    const submitted = submittedCategoryIds(submission)
    return submitted.length > 0 && !sameIdSet(submitted, currentIds)
  })
}

const renderConfigChangedWarning = (doc, scheme, year, copy, urls) => {
  const banner = doc.querySelector('[data-testid="obligation-config-changed"]')
  if (!banner) return
  const quarters = divergedQuarters(scheme, year)
  if (quarters.length === 0) {
    banner.hidden = true
    return
  }
  const list = doc.querySelector(
    '[data-testid="obligation-config-changed-list"]'
  )
  list.innerHTML = quarters
    .map((quarter) => {
      const href = urls.quarterly
        .replace('{quarter}', quarter)
        .replace('{step}', 'member-list')
      const text = copy.configChanged.resubmitAction.replace(
        '{quarter}',
        quarter
      )
      return `<li><a class="govuk-link" href="${escape(href)}" data-testid="obligation-config-changed-${escape(quarter)}">${escape(text)}</a></li>`
    })
    .join('')
  banner.hidden = false
}

const render = (doc, scheme, year, copy, urls) => {
  const latest = storage.getObligationSnapshot(scheme.id, year)
  const previous = storage
    .listObligationSnapshots({ schemeId: scheme.id })
    .filter((snapshot) => snapshot.id !== latest?.id)
  renderPrevious(doc, previous)
  setHidden(doc, '[data-testid="obligation-calculate"]', Boolean(latest))
  if (!latest) {
    renderConfigChangedWarning(doc, scheme, year, copy, urls)
    showEmptyState(doc)
    return 'awaiting-calculation'
  }
  setHidden(doc, '[data-testid="obligation-config-changed"]', true)
  renderSnapshot(doc, latest, copy)
  showResults(doc)
  return 'rendered'
}

export const runObligationPage = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  const scheme = ensureScheme(loc)
  if (!scheme) return 'redirected-to-sign-in'
  const year = payload.compliancePeriodYear

  const status = render(doc, scheme, year, payload.copy, payload.urls)

  const button = doc.querySelector('[data-testid="obligation-calculate"]')
  if (button) {
    button.addEventListener('click', (event) => {
      event.preventDefault()
      // Once-per-year guard: never calculate twice for the same period.
      if (storage.getObligationSnapshot(scheme.id, year)) return
      // Categories changed since a return was submitted: the scheme must
      // resubmit the affected returns before an obligation can be calculated.
      if (divergedQuarters(scheme, year).length > 0) {
        renderConfigChangedWarning(
          doc,
          scheme,
          year,
          payload.copy,
          payload.urls
        )
        return
      }
      if (
        !allQuartersSubmitted(scheme, year) &&
        !globalThis.confirm(payload.copy.incompleteQuartersConfirm)
      ) {
        return
      }
      storage.saveObligationSnapshot(
        buildObligationSnapshot({
          scheme,
          compliancePeriodYear: year,
          quarterly: storage.listQuarterlySubmissions(scheme.id, year),
          evidence: storage.listEvidence(scheme.id, year)
        })
      )
      render(doc, scheme, year, payload.copy, payload.urls)
    })
  }

  return status
}
