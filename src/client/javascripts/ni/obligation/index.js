import { storage } from '../storage.js'
import { calculateObligation } from './calculator.js'
import { seedSampleData } from '../seed.js'

const TAG_BY_STATUS = {
  met: { className: 'govuk-tag govuk-tag--green', text: 'Met' },
  shortfall: { className: 'govuk-tag govuk-tag--red', text: 'Shortfall' },
  'take-back': { className: 'govuk-tag govuk-tag--blue', text: 'Take-back' },
  'not-yet': {
    className: 'govuk-tag govuk-tag--grey',
    text: 'Not yet in force'
  }
}

const formatTonnes = (value) => (value === null ? '—' : `${value} t`)
const formatPercent = (value) => `${value}%`

const cell = (doc, content) => {
  const td = doc.createElement('td')
  td.className = 'govuk-table__cell'
  td.textContent = content
  return td
}

const annotatedCell = (doc, content, key, legislation) => {
  const td = doc.createElement('td')
  td.className = 'govuk-table__cell'
  const annotation = doc.createElement('span')
  annotation.className = 'app-eubr-annotation'
  annotation.setAttribute('data-eubr', key)
  annotation.setAttribute('data-eubr-articles', legislation.articles)
  annotation.setAttribute('data-eubr-title', legislation.title)
  annotation.setAttribute('data-eubr-summary', legislation.summary)
  annotation.setAttribute('data-eubr-applies-from', legislation.appliesFrom)
  annotation.setAttribute(
    'aria-label',
    `EU Batteries Regulation ${legislation.articles} — ${legislation.title}`
  )
  annotation.textContent = content
  td.appendChild(annotation)
  return td
}

const maybeAnnotatedCell = (doc, content, key, legislation) =>
  legislation
    ? annotatedCell(doc, content, key, legislation)
    : cell(doc, content)

const statusCell = (doc, status) => {
  const td = doc.createElement('td')
  td.className = 'govuk-table__cell'
  const config = TAG_BY_STATUS[status]
  const tag = doc.createElement('strong')
  tag.className = config.className
  tag.textContent = config.text
  td.appendChild(tag)
  return td
}

const headerRow = (doc, headers) => {
  const tr = doc.createElement('tr')
  tr.className = 'govuk-table__row'
  headers.forEach((header) => {
    const th = doc.createElement('th')
    th.className = 'govuk-table__header'
    th.setAttribute('scope', 'col')
    th.textContent = header
    tr.appendChild(th)
  })
  return tr
}

const table = (doc, headers, rows) => {
  const element = doc.createElement('table')
  element.className = 'govuk-table'
  const thead = doc.createElement('thead')
  thead.className = 'govuk-table__head'
  thead.appendChild(headerRow(doc, headers))
  element.appendChild(thead)
  const tbody = doc.createElement('tbody')
  tbody.className = 'govuk-table__body'
  rows.forEach((row) => tbody.appendChild(row))
  element.appendChild(tbody)
  return element
}

const collectionRow = (doc, stream) => {
  const tr = doc.createElement('tr')
  tr.className = 'govuk-table__row'
  tr.setAttribute('data-ni-obligation-stream', stream.key)
  tr.appendChild(cell(doc, stream.label))
  tr.appendChild(
    annotatedCell(doc, stream.targetLabel, stream.key, stream.legislation)
  )
  tr.appendChild(cell(doc, formatTonnes(stream.placedOnMarket)))
  tr.appendChild(
    maybeAnnotatedCell(
      doc,
      formatTonnes(stream.averagePlacedOnMarket),
      `${stream.key}-avg`,
      stream.averageLegislation
    )
  )
  tr.appendChild(
    maybeAnnotatedCell(
      doc,
      formatTonnes(stream.requiredCollection),
      `${stream.key}-required`,
      stream.requiredLegislation
    )
  )
  tr.appendChild(cell(doc, formatTonnes(stream.actualCollection)))
  tr.appendChild(cell(doc, formatTonnes(stream.shortfall)))
  tr.appendChild(statusCell(doc, stream.status))
  return tr
}

const recyclingRow = (doc, row) => {
  const tr = doc.createElement('tr')
  tr.className = 'govuk-table__row'
  tr.appendChild(cell(doc, row.label))
  tr.appendChild(cell(doc, formatPercent(row.achievedPercent)))
  tr.appendChild(
    annotatedCell(
      doc,
      formatPercent(row.targetPercent),
      row.key,
      row.legislation
    )
  )
  tr.appendChild(statusCell(doc, row.status))
  return tr
}

const buildPeriod = (doc, period) => {
  const section = doc.createElement('section')
  section.className = 'govuk-!-margin-bottom-8'
  section.setAttribute('data-ni-obligation-period', period.period)

  const heading = doc.createElement('h2')
  heading.className = 'govuk-heading-m'
  heading.textContent = `Compliance period ${period.period}`
  section.appendChild(heading)

  const collectionHeading = doc.createElement('h3')
  collectionHeading.className = 'govuk-heading-s'
  collectionHeading.textContent = 'Collection obligation'
  section.appendChild(collectionHeading)
  section.appendChild(
    table(
      doc,
      [
        'Battery stream',
        'Target',
        'Placed on market',
        'Avg POM (3 yr)',
        'Required collection',
        'Collected',
        'Shortfall',
        'Status'
      ],
      period.streams.map((stream) => collectionRow(doc, stream))
    )
  )

  const recyclingHeading = doc.createElement('h3')
  recyclingHeading.className = 'govuk-heading-s'
  recyclingHeading.textContent = 'Recycling efficiency'
  section.appendChild(recyclingHeading)
  section.appendChild(
    table(
      doc,
      ['Battery chemistry', 'Achieved', 'Target', 'Status'],
      period.recycling.map((row) => recyclingRow(doc, row))
    )
  )

  return section
}

const renderResults = (doc, result) => {
  const empty = doc.querySelector('[data-ni-obligation-empty]')
  const results = doc.querySelector('[data-ni-obligation-results]')
  if (!result.hasData) return
  empty.hidden = true
  results.hidden = false
  result.periods.forEach((period) =>
    results.appendChild(buildPeriod(doc, period))
  )
}

export const initNiObligation = (
  doc = globalThis.document,
  win = globalThis.window
) => {
  if (new URLSearchParams(win.location.search).has('seed')) {
    seedSampleData(storage)
  }
  const result = calculateObligation({
    registration: storage.getRegistration(),
    annualReturns: storage.listAnnualReturns()
  })
  renderResults(doc, result)
  return result
}
