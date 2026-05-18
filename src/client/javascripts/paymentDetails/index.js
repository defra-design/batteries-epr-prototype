import { storage } from '../storage-adapter.js'
import { readPagePayload } from '../page-payload.js'
import { requireAuth } from '../auth-gate.js'
import { currentCompliancePeriod } from '../compliance-period.js'

const formatPounds = (amountPence) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(amountPence / 100)

const setText = (doc, selector, text) => {
  const node = doc.querySelector(selector)
  if (node) node.textContent = text
}

const showSection = (doc, id, visible) => {
  const node = doc.querySelector(`#${id}`)
  if (node) node.hidden = !visible
}

const readPaymentIdFromQuery = (loc) => {
  const search = loc?.search ?? ''
  const params = new URLSearchParams(search)
  return params.get('paymentId') ?? ''
}

export const initPaymentDetails = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc) ?? {}
  const signInUrl = payload.signInUrl ?? '/sign-in'

  if (!requireAuth(signInUrl)) return false

  const paymentId = readPaymentIdFromQuery(loc)
  const payment = paymentId ? storage.getPayment(paymentId) : null
  if (!payment) {
    loc.assign(payload.dashboardUrl ?? '/dashboard')
    return 'redirected-to-dashboard'
  }

  const user = storage.getCurrentUser()
  const producer = storage.getProducerByEmail(user.email)
  const compliancePeriod = payload.compliancePeriod ?? currentCompliancePeriod()

  setText(
    doc,
    '[data-testid="payment-details-organisation"]',
    producer?.companyName ?? ''
  )
  setText(doc, '[data-testid="payment-details-period"]', compliancePeriod)
  setText(
    doc,
    '[data-testid="payment-details-amount"]',
    formatPounds(payment.amountPence)
  )
  setText(doc, '[data-testid="payment-details-id"]', payment.id)

  showSection(doc, 'payment-details-loading', false)
  showSection(doc, 'payment-details-content', true)

  return 'rendered'
}
