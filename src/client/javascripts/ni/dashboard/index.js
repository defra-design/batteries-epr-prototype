import { storage } from '../storage.js'

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
}
