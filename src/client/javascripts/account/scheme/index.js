import { storage } from '../../storage-adapter.js'
import { requireAuth } from '../../auth-gate.js'
import { readPagePayload } from '../../page-payload.js'

const findRegistration = (producerId, compliancePeriod) =>
  storage
    .listRegistrationsForProducer(producerId)
    .find((r) => r.compliancePeriod === compliancePeriod)

const setText = (doc, testId, value) => {
  doc.querySelector(`[data-testid="${testId}"]`).textContent = value || '—'
}

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

const renderTimeline = (doc, memberships, labels) => {
  const list = doc.querySelector('[data-testid="account-scheme-timeline"]')

  if (!memberships.length) {
    setHidden(doc, 'account-scheme-timeline-empty', false)
    return
  }

  list.innerHTML = memberships
    .map((m) => {
      const scheme = storage.getScheme(m.schemeId)
      const name = scheme?.name ?? labels.notFoundName
      const joined = formatDate(m.joinedOn)
      const left = m.leftOn ? formatDate(m.leftOn) : labels.timelineActive
      const reason = m.reasonForLeaving
        ? ` · ${labels.timelineReason}: ${m.reasonForLeaving}`
        : ''
      return `<li data-testid="account-scheme-timeline-row" data-membership-id="${m.id}">${name} — ${labels.timelineJoined} ${joined} · ${labels.timelineLeft} ${left}${reason}</li>`
    })
    .join('')
}

const setHidden = (doc, id, hidden) => {
  doc.querySelector(`[data-testid="${id}"]`).hidden = hidden
}

export const renderAccountScheme = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc) ?? {}
  if (!requireAuth(payload.signInUrl)) return false

  const user = storage.getCurrentUser()
  const producer = storage.getProducerByEmail(user.email)
  if (!producer) {
    loc.assign(payload.accountUrl)
    return 'redirected-to-account'
  }

  const compliancePeriod = payload.compliancePeriod
  const registration = findRegistration(producer.id, compliancePeriod)
  const labels = payload.labels

  setHidden(doc, 'account-scheme-loading', true)

  if (registration?.producerRoute !== 'complianceScheme') {
    setHidden(doc, 'account-scheme-not-member', false)
    return 'not-member'
  }

  const scheme = registration.schemeId
    ? storage.getScheme(registration.schemeId)
    : null

  setText(doc, 'account-scheme-name', scheme?.name)
  setText(doc, 'account-scheme-operator', scheme?.operator)
  setText(doc, 'account-scheme-approval-number', scheme?.approvalNumber)
  setText(doc, 'account-scheme-contact-email', scheme?.contactEmail)
  setText(doc, 'account-scheme-web-address', scheme?.webAddress)

  const memberships = producer.bprn
    ? storage.getSchemeMembershipHistory(producer.bprn)
    : []
  renderTimeline(doc, memberships, labels)

  setHidden(doc, 'account-scheme-content', false)
  return 'rendered'
}
