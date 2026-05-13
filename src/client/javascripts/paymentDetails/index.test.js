// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { initPaymentDetails } from './index.js'
import { storage } from '../storage-adapter.js'

const PAYLOAD = {
  signInUrl: '/sign-in',
  dashboardUrl: '/dashboard',
  compliancePeriod: '2026'
}

const buildDom = (payload = PAYLOAD) => {
  document.body.innerHTML = `
    <div id="payment-details-loading" data-testid="payment-details-loading"></div>
    <div id="payment-details-content" data-testid="payment-details-content" hidden>
      <dd data-testid="payment-details-organisation"></dd>
      <dd data-testid="payment-details-period"></dd>
      <dd data-testid="payment-details-amount"></dd>
      <dd data-testid="payment-details-id"></dd>
    </div>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

let assignSpy
let location

beforeEach(() => {
  globalThis.localStorage.clear()
  assignSpy = vi.fn()
  location = { assign: assignSpy, search: '' }
  Object.defineProperty(globalThis, 'location', {
    value: location,
    writable: true,
    configurable: true
  })
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('initPaymentDetails auth + state gates', () => {
  test('redirects to sign-in when not authenticated', () => {
    buildDom()
    expect(initPaymentDetails(document, location)).toBe(false)
    expect(assignSpy).toHaveBeenCalledWith('/sign-in')
  })

  test('redirects to dashboard when there is no paymentId in the URL', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    buildDom()
    expect(initPaymentDetails(document, location)).toBe(
      'redirected-to-dashboard'
    )
    expect(assignSpy).toHaveBeenCalledWith('/dashboard')
  })

  test('redirects to dashboard when the paymentId does not exist', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    location.search = '?paymentId=does-not-exist'
    buildDom()
    expect(initPaymentDetails(document, location)).toBe(
      'redirected-to-dashboard'
    )
    expect(assignSpy).toHaveBeenCalledWith('/dashboard')
  })

  test('falls back to /dashboard when payload omits dashboardUrl', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    document.body.innerHTML = `<script id="page-payload" type="application/json">{}</script>`
    expect(initPaymentDetails(document, location)).toBe(
      'redirected-to-dashboard'
    )
    expect(assignSpy).toHaveBeenCalledWith('/dashboard')
  })

  test('treats a missing location.search as no paymentId', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    location.search = undefined
    buildDom()
    expect(initPaymentDetails(document, location)).toBe(
      'redirected-to-dashboard'
    )
  })
})

describe('initPaymentDetails rendering', () => {
  test('shows the receipt details for a known payment', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme Power Ltd',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const payment = storage.createPayment('reg-1', 3000)
    location.search = `?paymentId=${payment.id}`
    buildDom()

    expect(initPaymentDetails(document, location)).toBe('rendered')
    expect(
      document.querySelector('[data-testid="payment-details-organisation"]')
        .textContent
    ).toBe('Acme Power Ltd')
    expect(
      document.querySelector('[data-testid="payment-details-period"]')
        .textContent
    ).toBe('2026')
    expect(
      document.querySelector('[data-testid="payment-details-amount"]')
        .textContent
    ).toContain('£30')
    expect(
      document.querySelector('[data-testid="payment-details-id"]').textContent
    ).toBe(payment.id)
    expect(
      document.querySelector('[data-testid="payment-details-loading"]').hidden
    ).toBe(true)
    expect(
      document.querySelector('[data-testid="payment-details-content"]').hidden
    ).toBe(false)
  })

  test('renders an empty organisation when the producer record is missing', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    const payment = storage.createPayment('reg-1', 5000)
    location.search = `?paymentId=${payment.id}`
    buildDom()

    expect(initPaymentDetails(document, location)).toBe('rendered')
    expect(
      document.querySelector('[data-testid="payment-details-organisation"]')
        .textContent
    ).toBe('')
  })

  test('runs with completely empty DOM without throwing', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const payment = storage.createPayment('reg-1', 3000)
    location.search = `?paymentId=${payment.id}`
    document.body.innerHTML = `<script id="page-payload" type="application/json">${JSON.stringify(PAYLOAD)}</script>`
    expect(() => initPaymentDetails(document, location)).not.toThrow()
  })

  test('runs with no page-payload script tag (uses all defaults)', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const payment = storage.createPayment('reg-1', 3000)
    location.search = `?paymentId=${payment.id}`
    document.body.innerHTML = ''
    expect(initPaymentDetails(document, location)).toBe('rendered')
  })

  test('falls back to default compliance period when payload omits it', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const payment = storage.createPayment('reg-1', 3000)
    location.search = `?paymentId=${payment.id}`
    document.body.innerHTML = `
      <div id="payment-details-loading" data-testid="payment-details-loading"></div>
      <div id="payment-details-content" data-testid="payment-details-content" hidden>
        <dd data-testid="payment-details-organisation"></dd>
        <dd data-testid="payment-details-period"></dd>
        <dd data-testid="payment-details-amount"></dd>
        <dd data-testid="payment-details-id"></dd>
      </div>
      <script id="page-payload" type="application/json">{}</script>
    `

    initPaymentDetails(document, location)
    expect(
      document.querySelector('[data-testid="payment-details-period"]')
        .textContent
    ).toBe('2026')
  })
})
