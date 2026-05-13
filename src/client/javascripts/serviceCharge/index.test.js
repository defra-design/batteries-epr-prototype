// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { initServiceCharge } from './index.js'
import { storage } from '../storage-adapter.js'

const PAYLOAD = {
  signInUrl: '/sign-in',
  paymentDetailsUrl: '/payment-details',
  dashboardUrl: '/dashboard',
  compliancePeriod: '2026',
  labels: {
    organisationLabel: 'Organisation',
    feeLabel: 'Service charge',
    complianceLabel: 'Compliance period',
    smallProducerNote: 'Small producer fee.',
    directRegistrantNote: 'Direct registrant fee.',
    processing: 'Connecting to GOV.UK Pay…'
  }
}

const buildDom = (payload = PAYLOAD) => {
  document.body.innerHTML = `
    <div id="service-charge-loading" data-testid="service-charge-loading"><p>Loading…</p></div>
    <div id="service-charge-content" data-testid="service-charge-content" hidden>
      <dd data-testid="service-charge-organisation"></dd>
      <dd data-testid="service-charge-period"></dd>
      <dd data-testid="service-charge-fee"></dd>
      <p data-testid="service-charge-note"></p>
      <button id="service-charge-pay" data-testid="service-charge-pay">Pay</button>
    </div>
    <div id="service-charge-processing" data-testid="service-charge-processing" hidden>
      <p data-testid="service-charge-processing-message">${payload.labels.processing}</p>
    </div>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

const setupProducerWithRegistration = (overrides = {}) => {
  storage.setCurrentUser({ email: 'a@b.com' })
  storage.saveProducer({
    contactEmail: 'a@b.com',
    companyName: 'Acme Power Ltd',
    registeredAddress: { postcode: 'M1 4AA' }
  })
  const producer = storage.getProducerByEmail('a@b.com')
  return storage.saveRegistration({
    producerId: producer.id,
    compliancePeriod: '2026',
    status: 'Submitted',
    producerRoute: 'smallProducer',
    ...overrides
  })
}

let assignSpy

beforeEach(() => {
  globalThis.localStorage.clear()
  assignSpy = vi.fn()
  Object.defineProperty(globalThis, 'location', {
    value: { assign: assignSpy },
    writable: true,
    configurable: true
  })
})

afterEach(() => {
  globalThis.localStorage.clear()
  vi.useRealTimers()
})

describe('initServiceCharge auth + state gates', () => {
  test('redirects to sign-in when not authenticated', () => {
    buildDom()
    expect(initServiceCharge(document, globalThis.location)).toBe(false)
    expect(assignSpy).toHaveBeenCalledWith('/sign-in')
  })

  test('redirects to dashboard when there is no producer record', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    buildDom()
    expect(initServiceCharge(document, globalThis.location)).toBe(
      'redirected-to-dashboard'
    )
    expect(assignSpy).toHaveBeenCalledWith('/dashboard')
  })

  test('redirects to dashboard when there is no registration for the period', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    buildDom()
    expect(initServiceCharge(document, globalThis.location)).toBe(
      'redirected-to-dashboard'
    )
    expect(assignSpy).toHaveBeenCalledWith('/dashboard')
  })

  test('redirect URLs fall back when payload omits them', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    document.body.innerHTML = `<script id="page-payload" type="application/json">{}</script>`
    expect(initServiceCharge(document, globalThis.location)).toBe(
      'redirected-to-dashboard'
    )
    expect(assignSpy).toHaveBeenCalledWith('/dashboard')
  })

  test('falls back to /dashboard when registration missing AND payload has no dashboardUrl', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const payload = { ...PAYLOAD }
    delete payload.dashboardUrl
    buildDom(payload)

    expect(initServiceCharge(document, globalThis.location)).toBe(
      'redirected-to-dashboard'
    )
    expect(assignSpy).toHaveBeenCalledWith('/dashboard')
  })
})

describe('initServiceCharge rendering', () => {
  test('renders organisation, period, small-producer fee, and small-producer note', () => {
    setupProducerWithRegistration({ producerRoute: 'smallProducer' })
    buildDom()

    expect(initServiceCharge(document, globalThis.location)).toBe('rendered')
    expect(
      document.querySelector('[data-testid="service-charge-organisation"]')
        .textContent
    ).toBe('Acme Power Ltd')
    expect(
      document.querySelector('[data-testid="service-charge-period"]')
        .textContent
    ).toBe('2026')
    expect(
      document.querySelector('[data-testid="service-charge-fee"]').textContent
    ).toContain('£30')
    expect(
      document.querySelector('[data-testid="service-charge-note"]').textContent
    ).toBe('Small producer fee.')
    expect(
      document.querySelector('[data-testid="service-charge-loading"]').hidden
    ).toBe(true)
    expect(
      document.querySelector('[data-testid="service-charge-content"]').hidden
    ).toBe(false)
  })

  test('renders direct-registrant fee and note for that route', () => {
    setupProducerWithRegistration({ producerRoute: 'directRegistrant' })
    buildDom()
    initServiceCharge(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="service-charge-fee"]').textContent
    ).toContain('£550')
    expect(
      document.querySelector('[data-testid="service-charge-note"]').textContent
    ).toBe('Direct registrant fee.')
  })

  test('handles a payload with no labels object', () => {
    setupProducerWithRegistration()
    document.body.innerHTML = `
      <div id="service-charge-loading" data-testid="service-charge-loading"></div>
      <div id="service-charge-content" data-testid="service-charge-content" hidden>
        <dd data-testid="service-charge-organisation"></dd>
        <dd data-testid="service-charge-period"></dd>
        <dd data-testid="service-charge-fee"></dd>
        <p data-testid="service-charge-note"></p>
        <button id="service-charge-pay" data-testid="service-charge-pay">Pay</button>
      </div>
      <div id="service-charge-processing" data-testid="service-charge-processing" hidden></div>
      <script id="page-payload" type="application/json">{"signInUrl":"/sign-in","paymentDetailsUrl":"/payment-details","dashboardUrl":"/dashboard","compliancePeriod":"2026"}</script>
    `
    expect(initServiceCharge(document, globalThis.location)).toBe('rendered')
    expect(
      document.querySelector('[data-testid="service-charge-note"]').textContent
    ).toBe('')
  })

  test('renders without a missing companyName', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    globalThis.localStorage.setItem(
      'npwd-batteries:producers',
      JSON.stringify({
        'a@b.com': { contactEmail: 'a@b.com' }
      })
    )
    const producer = storage.getProducerByEmail('a@b.com')
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      status: 'Submitted',
      producerRoute: 'smallProducer'
    })
    buildDom()

    expect(initServiceCharge(document, globalThis.location)).toBe('rendered')
    expect(
      document.querySelector('[data-testid="service-charge-organisation"]')
        .textContent
    ).toBe('')
  })

  test('runs with completely empty DOM without throwing', () => {
    setupProducerWithRegistration()
    document.body.innerHTML = `<script id="page-payload" type="application/json">${JSON.stringify(PAYLOAD)}</script>`
    expect(() => initServiceCharge(document, globalThis.location)).not.toThrow()
  })

  test('falls back to default compliance period when payload omits it', () => {
    setupProducerWithRegistration({ producerRoute: 'smallProducer' })
    const noPeriodPayload = { ...PAYLOAD }
    delete noPeriodPayload.compliancePeriod
    buildDom(noPeriodPayload)

    initServiceCharge(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="service-charge-period"]')
        .textContent
    ).toBe('2026')
  })

  test('directRegistrant note falls back to empty when label is missing', () => {
    setupProducerWithRegistration({ producerRoute: 'directRegistrant' })
    const payload = {
      ...PAYLOAD,
      labels: { ...PAYLOAD.labels, directRegistrantNote: undefined }
    }
    buildDom(payload)
    initServiceCharge(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="service-charge-note"]').textContent
    ).toBe('')
  })

  test('runs with no page-payload script tag (uses all defaults)', () => {
    setupProducerWithRegistration()
    document.body.innerHTML = `
      <div id="service-charge-loading"></div>
      <div id="service-charge-content" hidden>
        <dd data-testid="service-charge-organisation"></dd>
        <dd data-testid="service-charge-period"></dd>
        <dd data-testid="service-charge-fee"></dd>
        <p data-testid="service-charge-note"></p>
        <button id="service-charge-pay" data-testid="service-charge-pay">Pay</button>
      </div>
      <div id="service-charge-processing" hidden></div>
    `
    expect(initServiceCharge(document, globalThis.location)).toBe('rendered')
  })

  test('runs without a pay button silently', () => {
    setupProducerWithRegistration()
    document.body.innerHTML = `
      <div id="service-charge-loading" data-testid="service-charge-loading"></div>
      <div id="service-charge-content" data-testid="service-charge-content" hidden>
        <dd data-testid="service-charge-organisation"></dd>
        <dd data-testid="service-charge-period"></dd>
        <dd data-testid="service-charge-fee"></dd>
        <p data-testid="service-charge-note"></p>
      </div>
      <div id="service-charge-processing" data-testid="service-charge-processing" hidden></div>
      <script id="page-payload" type="application/json">${JSON.stringify(PAYLOAD)}</script>
    `
    expect(initServiceCharge(document, globalThis.location)).toBe('rendered')
  })
})

describe('initServiceCharge payment flow', () => {
  test('clicking Pay creates a payment, completes after 1s, marks Approved, and navigates', async () => {
    vi.useFakeTimers()
    const registration = setupProducerWithRegistration()
    buildDom()

    initServiceCharge(document, globalThis.location)
    document.querySelector('[data-testid="service-charge-pay"]').click()

    expect(
      document.querySelector('[data-testid="service-charge-content"]').hidden
    ).toBe(true)
    expect(
      document.querySelector('[data-testid="service-charge-processing"]').hidden
    ).toBe(false)

    await vi.advanceTimersByTimeAsync(1000)

    const refreshed = storage.getRegistration(registration.id)
    expect(refreshed.status).toBe('Approved')
    expect(refreshed.fee.status).toBe('Success')
    expect(assignSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^\/payment-details\?paymentId=/)
    )
  })

  test('does nothing when completePayment resolves null (unknown payment id)', async () => {
    vi.useFakeTimers()
    setupProducerWithRegistration()
    buildDom()
    initServiceCharge(document, globalThis.location)

    const originalComplete = storage.completePayment
    storage.completePayment = () => Promise.resolve(null)

    document.querySelector('[data-testid="service-charge-pay"]').click()
    await vi.advanceTimersByTimeAsync(1000)

    expect(assignSpy).not.toHaveBeenCalled()
    storage.completePayment = originalComplete
  })

  test('falls back to /payment-details when payload omits paymentDetailsUrl', async () => {
    vi.useFakeTimers()
    setupProducerWithRegistration()
    const payload = { ...PAYLOAD }
    delete payload.paymentDetailsUrl
    buildDom(payload)

    initServiceCharge(document, globalThis.location)
    document.querySelector('[data-testid="service-charge-pay"]').click()
    await vi.advanceTimersByTimeAsync(1000)

    expect(assignSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^\/payment-details\?paymentId=/)
    )
  })
})
