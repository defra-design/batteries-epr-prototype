import { storage } from '../storage.js'

const COMPLETED = { text: 'Completed', classes: 'govuk-tag--green' }
const SUBMITTED = { text: 'Submitted', classes: 'govuk-tag--blue' }
const NOT_STARTED = { text: 'Not started', classes: 'govuk-tag--grey' }

const ANNUAL_RETURN_CARDS = new Set(['reporting', 'collectionTargets'])

const statusFor = (key, registration, hasReturnThisYear) => {
  if (ANNUAL_RETURN_CARDS.has(key)) {
    return hasReturnThisYear ? SUBMITTED : NOT_STARTED
  }
  return registration ? COMPLETED : NOT_STARTED
}

const setCardStatus = (doc, wrapper, status) => {
  const tag = doc.createElement('strong')
  tag.className = `govuk-tag ${status.classes}`
  tag.textContent = status.text
  wrapper.replaceChildren(tag)
}

const applyCardStatuses = (doc, registration, returns, currentPeriod) => {
  const hasReturnThisYear = returns.some(
    (entry) => entry.period === currentPeriod
  )
  doc.querySelectorAll('[data-ni-card-status]').forEach((wrapper) => {
    const key = wrapper.getAttribute('data-ni-card-status')
    setCardStatus(doc, wrapper, statusFor(key, registration, hasReturnThisYear))
  })
}

const cell = (doc, text) => {
  const td = doc.createElement('td')
  td.className = 'govuk-table__cell'
  td.textContent = text
  return td
}

const renderRegistration = (doc, registration) => {
  const status = doc.querySelector('[data-ni-registration-status]')
  status.textContent = `Registered — BPRN ${registration.bprn} (compliance period ${registration.period})`
}

const renderAnnualReturns = (doc, returns) => {
  const empty = doc.querySelector('[data-ni-annual-returns-empty]')
  const table = doc.querySelector('[data-ni-annual-returns-table]')
  const body = doc.querySelector('[data-ni-annual-returns-body]')

  empty.hidden = true
  table.hidden = false

  returns.forEach((entry) => {
    const row = doc.createElement('tr')
    row.className = 'govuk-table__row'
    row.appendChild(cell(doc, entry.period))
    row.appendChild(cell(doc, entry.reference))
    row.appendChild(cell(doc, entry.createdAt.slice(0, 10)))
    body.appendChild(row)
  })
}

export const initNiDashboard = (doc = globalThis.document) => {
  const registration = storage.getRegistration()
  if (registration) renderRegistration(doc, registration)

  const returns = storage.listAnnualReturns()
  if (returns.length > 0) renderAnnualReturns(doc, returns)

  const cards = doc.querySelector('[data-testid="ni-dashboard-cards"]')
  const currentPeriod = cards.getAttribute('data-ni-current-period')
  applyCardStatuses(doc, registration, returns, currentPeriod)
}
