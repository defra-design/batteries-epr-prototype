import { storage } from '../storage-adapter.js'
import { readPagePayload } from '../page-payload.js'
import { requireAuth } from '../auth-gate.js'
import { feeForRoute, FEE_SCHEDULE } from '../../../config/fees.js'

const findRegistration = (producerId, compliancePeriod) =>
  storage
    .listRegistrationsForProducer(producerId)
    .find((r) => r.compliancePeriod === compliancePeriod) ?? null

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

export const initServiceCharge = (
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
    return 'redirected-to-dashboard'
  }

  const compliancePeriod = payload.compliancePeriod ?? '2026'
  const registration = findRegistration(producer.id, compliancePeriod)
  if (!registration) {
    loc.assign(payload.dashboardUrl ?? '/dashboard')
    return 'redirected-to-dashboard'
  }

  const fee = feeForRoute(registration.producerRoute)
  const labels = payload.labels ?? {}
  setText(
    doc,
    '[data-testid="service-charge-organisation"]',
    producer.companyName ?? ''
  )
  setText(doc, '[data-testid="service-charge-period"]', compliancePeriod)
  setText(doc, '[data-testid="service-charge-fee"]', formatPounds(fee))
  setText(
    doc,
    '[data-testid="service-charge-note"]',
    fee === FEE_SCHEDULE.smallProducer
      ? (labels.smallProducerNote ?? '')
      : (labels.directRegistrantNote ?? '')
  )

  showSection(doc, 'service-charge-loading', false)
  showSection(doc, 'service-charge-content', true)

  const button = doc.querySelector('[data-testid="service-charge-pay"]')
  if (button) {
    button.addEventListener('click', (event) => {
      event.preventDefault()
      handlePayClick({
        doc,
        loc,
        registration,
        fee,
        paymentDetailsUrl: payload.paymentDetailsUrl ?? '/payment-details'
      })
    })
  }

  return 'rendered'
}

const handlePayClick = async ({
  doc,
  loc,
  registration,
  fee,
  paymentDetailsUrl
}) => {
  showSection(doc, 'service-charge-content', false)
  showSection(doc, 'service-charge-processing', true)

  const payment = storage.createPayment(registration.id, fee)
  const completed = await storage.completePayment(payment.id)

  if (!completed || completed.status !== 'Success') {
    return
  }

  storage.saveRegistration({
    ...registration,
    status: 'Approved',
    feePaidAt: new Date().toISOString(),
    fee: {
      amountPence: fee,
      paymentId: payment.id,
      status: 'Success'
    }
  })

  loc.assign(`${paymentDetailsUrl}?paymentId=${encodeURIComponent(payment.id)}`)
}
