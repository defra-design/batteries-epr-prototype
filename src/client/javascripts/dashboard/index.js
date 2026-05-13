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

const findRegistration = (producerId, compliancePeriod) =>
  storage
    .listRegistrationsForProducer(producerId)
    .find((r) => r.compliancePeriod === compliancePeriod) ?? null

const setText = (doc, selector, text) => {
  const node = doc.querySelector(selector)
  if (node) node.textContent = text
}

const setTag = (doc, selector, text, classes) => {
  const node = doc.querySelector(selector)
  if (!node) return
  node.innerHTML = `<strong class="govuk-tag ${classes}">${escape(text)}</strong>`
}

const setLink = (doc, selector, href, text, testId) => {
  const node = doc.querySelector(selector)
  if (!node) return
  if (!href) {
    node.innerHTML = ''
    return
  }
  node.innerHTML = `<a class="govuk-link" href="${escape(href)}" data-testid="${testId}">${escape(text)}</a>`
}

const formatDate = (iso) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const renderRegistrationCard = (doc, copy, registration, producer) => {
  const status = registration?.status

  if (status === 'Approved') {
    setTag(
      doc,
      '[data-testid="card-registration-status"]',
      copy.statusApproved,
      'govuk-tag--green'
    )
    setText(
      doc,
      '[data-testid="card-registration-bprn"]',
      `${copy.bprnLabel} ${producer.bprn ?? copy.bprnPending}`
    )
    setText(
      doc,
      '[data-testid="card-registration-body"]',
      copy.approvedBody.replace(
        '{compliancePeriod}',
        registration.compliancePeriod
      )
    )
    setLink(doc, '[data-testid="card-registration-action"]', null)
    return
  }

  if (status === 'Submitted') {
    setTag(
      doc,
      '[data-testid="card-registration-status"]',
      copy.statusSubmitted,
      'govuk-tag--blue'
    )
    setText(
      doc,
      '[data-testid="card-registration-bprn"]',
      `${copy.bprnLabel} ${producer.bprn ?? copy.bprnPending}`
    )
    setText(doc, '[data-testid="card-registration-body"]', copy.submittedBody)
    setLink(doc, '[data-testid="card-registration-action"]', null)
    return
  }

  setTag(
    doc,
    '[data-testid="card-registration-status"]',
    copy.statusStarted,
    'govuk-tag--yellow'
  )
  setText(doc, '[data-testid="card-registration-bprn"]', '')
  setText(doc, '[data-testid="card-registration-body"]', copy.inProgressBody)
  setLink(
    doc,
    '[data-testid="card-registration-action"]',
    '/onboarding/company-details',
    copy.inProgressLink,
    'card-registration-continue-link'
  )
}

const renderFeeCard = (doc, copy, registration, urls) => {
  const feeStatus = registration?.fee?.status

  if (feeStatus === 'Success') {
    setTag(
      doc,
      '[data-testid="card-fee-status"]',
      copy.statusPaid,
      'govuk-tag--green'
    )
    setText(
      doc,
      '[data-testid="card-fee-body"]',
      copy.paidBody.replace('{compliancePeriod}', registration.compliancePeriod)
    )
    setLink(doc, '[data-testid="card-fee-action"]', null)
    return
  }

  if (registration?.status === 'Submitted') {
    setTag(
      doc,
      '[data-testid="card-fee-status"]',
      copy.statusDue,
      'govuk-tag--red'
    )
    setText(doc, '[data-testid="card-fee-body"]', '')
    setLink(
      doc,
      '[data-testid="card-fee-action"]',
      urls.payServiceChargeUrl,
      copy.payNow,
      'card-fee-pay-link'
    )
    return
  }

  setTag(
    doc,
    '[data-testid="card-fee-status"]',
    copy.statusNotApplicable,
    'govuk-tag--grey'
  )
  setText(doc, '[data-testid="card-fee-body"]', copy.notApplicableBody)
  setLink(doc, '[data-testid="card-fee-action"]', null)
}

const renderAnnualReturnCard = (doc, copy, registration, compliancePeriod) => {
  const submissions = registration
    ? storage.listSubmissionsForRegistration(registration.id)
    : []
  const latest = submissions.length ? submissions[submissions.length - 1] : null
  const status = latest?.status

  setText(
    doc,
    '[data-testid="card-annual-return-deadline"]',
    `${copy.deadlineLabel} ${copy.deadlineValue.replace('{compliancePeriod}', compliancePeriod)}`
  )

  if (registration?.status !== 'Approved') {
    setTag(
      doc,
      '[data-testid="card-annual-return-status"]',
      copy.statusNotStarted,
      'govuk-tag--grey'
    )
    setText(doc, '[data-testid="card-annual-return-body"]', copy.blockedBody)
    setLink(doc, '[data-testid="card-annual-return-action"]', null)
    return
  }

  if (status === 'Submitted') {
    setTag(
      doc,
      '[data-testid="card-annual-return-status"]',
      copy.statusSubmitted,
      'govuk-tag--blue'
    )
    setText(doc, '[data-testid="card-annual-return-body"]', '')
    setLink(doc, '[data-testid="card-annual-return-action"]', null)
    return
  }

  setTag(
    doc,
    '[data-testid="card-annual-return-status"]',
    status === 'Started' ? copy.statusInProgress : copy.statusNotStarted,
    status === 'Started' ? 'govuk-tag--yellow' : 'govuk-tag--grey'
  )
  setText(doc, '[data-testid="card-annual-return-body"]', '')
  const startUrl =
    registration.producerRoute === 'directRegistrant'
      ? `/annual-return/${registration.id}/ia/categories`
      : `/annual-return/${registration.id}/small-producer/tonnages`
  setLink(
    doc,
    '[data-testid="card-annual-return-action"]',
    startUrl,
    copy.startLink,
    'card-annual-return-start-link'
  )
}

const PRODUCER_CREATED = 1
const BPRN_ALLOCATED = 2
const REGISTRATION_STARTED = 3
const REGISTRATION_SUBMITTED = 4
const FEE_PAID = 5
const RETURN_SUBMITTED = 6

const buildActivityFeed = (producer, registration, submissions) => {
  const events = []
  if (producer?.createdAt) {
    events.push({
      at: producer.createdAt,
      order: PRODUCER_CREATED,
      text: 'Producer record created'
    })
  }
  if (producer?.bprn) {
    events.push({
      at: producer.bprnAllocatedAt ?? producer.updatedAt,
      order: BPRN_ALLOCATED,
      text: `BPRN ${producer.bprn} allocated`
    })
  }
  if (registration?.createdAt) {
    events.push({
      at: registration.createdAt,
      order: REGISTRATION_STARTED,
      text: `Registration started for ${registration.compliancePeriod}`
    })
  }
  if (registration?.status === 'Submitted' || registration?.submittedAt) {
    events.push({
      at: registration.submittedAt ?? registration.updatedAt,
      order: REGISTRATION_SUBMITTED,
      text: 'Registration submitted'
    })
  }
  if (registration?.fee?.status === 'Success') {
    events.push({
      at: registration.feePaidAt ?? registration.updatedAt,
      order: FEE_PAID,
      text: 'Service charge paid'
    })
  }
  for (const submission of submissions) {
    if (submission.status === 'Submitted') {
      events.push({
        at: submission.declaration?.declaredAt ?? submission.updatedAt,
        order: RETURN_SUBMITTED,
        text: `Annual return submitted for ${registration.compliancePeriod}`
      })
    }
  }
  return events.sort((a, b) => {
    const cmp = String(b.at).localeCompare(String(a.at))
    return cmp !== 0 ? cmp : b.order - a.order
  })
}

const renderActivityCard = (doc, copy, producer, registration) => {
  const submissions = registration
    ? storage.listSubmissionsForRegistration(registration.id)
    : []
  const events = buildActivityFeed(producer, registration, submissions)
  const list = doc.querySelector('[data-testid="card-activity-list"]')
  if (!list) return
  if (events.length === 0) {
    list.innerHTML = `<li class="govuk-body" data-testid="card-activity-empty">${escape(copy.empty)}</li>`
    return
  }
  list.innerHTML = events
    .map(
      (e) =>
        `<li class="govuk-body" data-testid="card-activity-item"><strong>${escape(formatDate(e.at))}</strong> — ${escape(e.text)}</li>`
    )
    .join('')
}

const showContent = (doc) => {
  const loading = doc.querySelector('[data-testid="dashboard-loading"]')
  const main = doc.querySelector('[data-testid="dashboard-content"]')
  if (loading) loading.hidden = true
  if (main) main.hidden = false
}

const setHeadingOrgName = (doc, companyName) => {
  if (!companyName) return
  const heading = doc.querySelector('[data-testid="app-heading"]')
  if (!heading) return
  let caption = heading.querySelector(
    '[data-testid="app-heading-organisation-name"]'
  )
  if (!caption) {
    caption = doc.createElement('p')
    caption.className = 'govuk-caption-xl'
    caption.setAttribute('data-testid', 'app-heading-organisation-name')
    const inner = heading.querySelector('.govuk-grid-column-full')
    if (inner) inner.insertBefore(caption, inner.firstChild)
  }
  caption.textContent = companyName
}

export const initDashboard = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc) ?? {}
  const signInUrl = payload.signInUrl ?? '/sign-in'

  if (!requireAuth(signInUrl)) return false

  const user = storage.getCurrentUser()
  const producer = storage.getProducerByEmail(user.email)

  if (!producer) {
    loc.assign(payload.onboardingStartUrl ?? '/onboarding/company-details')
    return 'redirected-to-onboarding'
  }

  const compliancePeriod = payload.compliancePeriod ?? '2026'
  const registration = findRegistration(producer.id, compliancePeriod)
  const cards = payload.cards

  setHeadingOrgName(doc, producer.companyName)
  if (cards) {
    renderRegistrationCard(doc, cards.registration, registration, producer)
    renderFeeCard(doc, cards.fee, registration, payload)
    renderAnnualReturnCard(
      doc,
      cards.annualReturn,
      registration,
      compliancePeriod
    )
    renderActivityCard(doc, cards.activity, producer, registration)
  }

  showContent(doc)
  return 'rendered'
}
