import { storage } from '../storage-adapter.js'
import { readPagePayload } from '../page-payload.js'
import { requireAuth } from '../auth-gate.js'

const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

const escape = (value) =>
  String(value).replace(/[&<>"']/g, (char) => HTML_ENTITIES[char])

const formatDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatAddress = (address) => {
  if (!address) return ''
  return [
    address.line1,
    address.line2,
    address.line3,
    address.line4,
    address.town,
    address.postcode
  ]
    .filter(Boolean)
    .join(', ')
}

const summaryRow = (key, value) =>
  `<div class="govuk-summary-list__row">
    <dt class="govuk-summary-list__key">${escape(key)}</dt>
    <dd class="govuk-summary-list__value">${escape(value)}</dd>
  </div>`

const renderCompany = (doc, copy, producer) => {
  const list = doc.querySelector('[data-testid="account-company-list"]')
  if (!list) return
  const empty = copy.empty
  const rows = [
    summaryRow(copy.companyName, producer.companyName || empty),
    summaryRow(copy.tradingName, producer.tradingName || empty),
    summaryRow(
      copy.companyRegistrationNo,
      producer.companyRegistrationNo || empty
    ),
    summaryRow(copy.webAddress, producer.webAddress || empty),
    summaryRow(copy.sicCode, producer.sicCode || empty),
    summaryRow(
      copy.registeredAddress,
      formatAddress(producer.registeredAddress) || empty
    ),
    summaryRow(copy.agencyCode, producer.agencyCode || empty)
  ].join('')
  list.innerHTML = rows
}

const renderContact = (doc, copy, producer) => {
  const list = doc.querySelector('[data-testid="account-contact-list"]')
  if (!list) return
  const contact = producer.primaryContact ?? {}
  const empty = '—'
  list.innerHTML = [
    summaryRow(copy.firstName, contact.firstName || empty),
    summaryRow(copy.lastName, contact.lastName || empty),
    summaryRow(copy.position, contact.position || empty),
    summaryRow(copy.phone, contact.phone || empty),
    summaryRow(copy.email, contact.email || empty)
  ].join('')
}

const renderServiceOfNotice = (doc, copy, producer) => {
  const list = doc.querySelector('[data-testid="account-son-list"]')
  if (!list) return
  const son = producer.serviceOfNoticeAddress
  const registered = producer.registeredAddress
  const sameAsRegistered =
    son &&
    registered &&
    son.line1 === registered.line1 &&
    son.line2 === registered.line2 &&
    son.town === registered.town &&
    son.postcode === registered.postcode
  const value = sameAsRegistered
    ? copy.sameAsRegistered
    : formatAddress(son) || '—'
  list.innerHTML = summaryRow(copy.title, value)
}

const renderBatteryTypes = (doc, copy, producer) => {
  const node = doc.querySelector('[data-testid="account-battery-types"]')
  if (!node) return
  const battery = producer.batteryTypes ?? {}
  const labels = []
  if (battery.isPortable) labels.push(copy.portable)
  if (battery.isIndustrial) labels.push(copy.industrial)
  if (battery.isAutomotive) labels.push(copy.automotive)
  node.textContent = labels.length ? labels.join(', ') : copy.none
}

const renderBrandNames = (doc, copy, producer) => {
  const list = doc.querySelector('[data-testid="account-brand-names"]')
  if (!list) return
  const names = producer.brandNames ?? []
  if (names.length === 0) {
    list.innerHTML = `<li class="govuk-body" data-testid="account-brand-names-empty">${escape(copy.empty)}</li>`
    return
  }
  list.innerHTML = names
    .map(
      (name) =>
        `<li class="govuk-body" data-testid="account-brand-name">${escape(name)}</li>`
    )
    .join('')
}

const renderSubmissions = (doc, copy, producer) => {
  const node = doc.querySelector('[data-testid="account-submissions"]')
  if (!node) return
  const registrations = storage.listRegistrationsForProducer(producer.id)
  const rows = []
  for (const registration of registrations) {
    const submissions = storage.listSubmissionsForRegistration(registration.id)
    for (const submission of submissions) {
      rows.push({
        registration,
        submission,
        sortKey: String(submission.updatedAt || '')
      })
    }
  }
  if (rows.length === 0) {
    node.innerHTML = `<p class="govuk-body" data-testid="account-submissions-empty">${escape(copy.empty)}</p>`
    return
  }
  rows.sort((a, b) => b.sortKey.localeCompare(a.sortKey))
  node.innerHTML = `<dl class="govuk-summary-list" data-testid="account-submissions-list">${rows
    .map(({ registration, submission }) =>
      summaryRow(
        `${copy.periodLabel} ${escape(registration.compliancePeriod)}`,
        `${copy.submissionLabel}: ${escape(submission.status)} (${escape(formatDate(submission.updatedAt))})`
      )
    )
    .join('')}</dl>`
}

const showContent = (doc) => {
  const loading = doc.querySelector('[data-testid="account-loading"]')
  const main = doc.querySelector('[data-testid="account-content"]')
  if (loading) loading.hidden = true
  if (main) main.hidden = false
}

const findRegistrationForProducer = (producer, compliancePeriod) =>
  storage
    .listRegistrationsForProducer(producer.id)
    .find((r) => r.compliancePeriod === compliancePeriod) ?? null

const renderSchemeRow = (doc, producer, compliancePeriod) => {
  const registration = findRegistrationForProducer(producer, compliancePeriod)
  if (registration?.producerRoute !== 'complianceScheme') return

  const scheme = registration.schemeId
    ? storage.getScheme(registration.schemeId)
    : null
  doc.querySelector('[data-testid="account-scheme-row-name"]').textContent =
    scheme?.name ?? ''
  doc.querySelector('[data-testid="account-scheme-section"]').hidden = false
}

const wireResetButton = (doc, loc) => {
  const button = doc.querySelector('[data-testid="account-reset-confirm"]')
  if (!button) return
  button.addEventListener('click', (event) => {
    event.preventDefault()
    storage.resetAllData()
    storage.seedDemoData()
    loc.assign('/')
  })
}

export const initAccount = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc) ?? {}
  const signInUrl = payload.signInUrl ?? '/sign-in'

  if (!requireAuth(signInUrl)) return false

  const user = storage.getCurrentUser()
  const producer = storage.getProducerByEmail(user.email)

  if (!producer) {
    loc.assign(payload.dashboardUrl ?? '/dashboard')
    return 'redirected'
  }

  const copy = payload.sections
  renderCompany(doc, copy.company, producer)
  renderContact(doc, copy.contact, producer)
  renderServiceOfNotice(doc, copy.serviceOfNotice, producer)
  renderBatteryTypes(doc, copy.batteryTypes, producer)
  renderBrandNames(doc, copy.brandNames, producer)
  renderSchemeRow(doc, producer, payload.compliancePeriod)
  renderSubmissions(doc, copy.submissions, producer)

  if (payload.showReset) {
    wireResetButton(doc, loc)
  }

  showContent(doc)
  return 'rendered'
}
