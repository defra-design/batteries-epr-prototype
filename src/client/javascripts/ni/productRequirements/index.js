import { storage } from '../storage.js'
import { seedSampleData } from '../seed.js'
import { calculateProductRequirements } from './calculator.js'

const TAG_BY_STATUS = {
  declared: { className: 'govuk-tag govuk-tag--green', text: 'Declared' },
  'not-declared': { className: 'govuk-tag govuk-tag--red', text: 'Not declared' },
  'not-applicable': { className: 'govuk-tag govuk-tag--grey', text: 'Not applicable' },
  complete: { className: 'govuk-tag govuk-tag--green', text: 'Complete' },
  incomplete: { className: 'govuk-tag govuk-tag--yellow', text: 'Incomplete' },
  provided: { className: 'govuk-tag govuk-tag--green', text: 'Provided' },
  missing: { className: 'govuk-tag govuk-tag--red', text: 'Missing' },
  met: { className: 'govuk-tag govuk-tag--green', text: 'Met' },
  below: { className: 'govuk-tag govuk-tag--red', text: 'Below' }
}

const NOT_APPLICABLE_NOTE =
  'Not applicable to your declared battery categories.'

const statusTag = (doc, status) => {
  const config = TAG_BY_STATUS[status]
  const tag = doc.createElement('strong')
  tag.className = `${config.className} govuk-!-margin-left-2`
  tag.textContent = config.text
  return tag
}

const annotatedHeading = (doc, section) => {
  const heading = doc.createElement('h2')
  heading.className = 'govuk-heading-m'
  const annotation = doc.createElement('span')
  annotation.className = 'app-eubr-annotation'
  annotation.setAttribute('data-eubr', section.key)
  annotation.setAttribute('data-eubr-articles', section.legislation.articles)
  annotation.setAttribute('data-eubr-title', section.legislation.title)
  annotation.setAttribute('data-eubr-summary', section.legislation.summary)
  annotation.setAttribute(
    'data-eubr-applies-from',
    section.legislation.appliesFrom
  )
  annotation.setAttribute(
    'aria-label',
    `EU Batteries Regulation ${section.legislation.articles} — ${section.legislation.title}`
  )
  annotation.textContent = section.heading
  heading.appendChild(annotation)
  heading.appendChild(statusTag(doc, section.status))
  return heading
}

const summaryRow = (doc, row) => {
  const wrapper = doc.createElement('div')
  wrapper.className = 'govuk-summary-list__row'
  const key = doc.createElement('dt')
  key.className = 'govuk-summary-list__key'
  key.textContent = row.label
  const value = doc.createElement('dd')
  value.className = 'govuk-summary-list__value'
  value.appendChild(doc.createTextNode(row.value))
  if (row.target) {
    value.appendChild(doc.createTextNode(` (minimum ${row.target})`))
  }
  if (row.status) {
    value.appendChild(statusTag(doc, row.status))
  }
  wrapper.appendChild(key)
  wrapper.appendChild(value)
  return wrapper
}

const buildSection = (doc, section) => {
  const element = doc.createElement('section')
  element.className = 'govuk-!-margin-bottom-8'
  element.setAttribute('data-ni-requirements-section', section.key)
  element.appendChild(annotatedHeading(doc, section))

  if (!section.applies) {
    const note = doc.createElement('p')
    note.className = 'govuk-body'
    note.textContent = NOT_APPLICABLE_NOTE
    element.appendChild(note)
    return element
  }

  const list = doc.createElement('dl')
  list.className = 'govuk-summary-list'
  section.rows.forEach((row) => list.appendChild(summaryRow(doc, row)))
  element.appendChild(list)
  return element
}

const renderResults = (doc, result) => {
  const empty = doc.querySelector('[data-ni-requirements-empty]')
  const results = doc.querySelector('[data-ni-requirements-results]')
  if (!result.hasData) return
  empty.hidden = true
  results.hidden = false
  result.sections.forEach((section) =>
    results.appendChild(buildSection(doc, section))
  )
}

export const initNiProductRequirements = (
  doc = globalThis.document,
  win = globalThis.window
) => {
  if (new URLSearchParams(win.location.search).has('seed')) {
    seedSampleData(storage)
  }
  const result = calculateProductRequirements(storage.getRegistration())
  renderResults(doc, result)
  return result
}
