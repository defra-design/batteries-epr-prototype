// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, test } from 'vitest'

import { storage } from '../../storage-adapter.js'
import { renderPayment } from './payment.js'

beforeEach(() => {
  globalThis.localStorage.clear()
})

afterEach(() => {
  globalThis.localStorage.clear()
  document.body.innerHTML = ''
})

describe('renderPayment', () => {
  test('creates and renders a payment reference', () => {
    document.body.innerHTML = '<dd data-testid="payment-reference"></dd>'
    const reference = renderPayment(document, storage)

    expect(reference).toMatch(/^S185756-\d{14}$/)
    expect(
      document.querySelector('[data-testid="payment-reference"]').textContent
    ).toBe(reference)
  })

  test('reuses the stored reference on revisits', () => {
    storage.savePrototypeSubmission({
      paymentReference: 'S185756-20260901120000'
    })
    document.body.innerHTML = '<dd data-testid="payment-reference"></dd>'

    expect(renderPayment(document, storage)).toBe('S185756-20260901120000')
  })
})
