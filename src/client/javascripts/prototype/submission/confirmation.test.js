// @vitest-environment jsdom
import { afterEach, describe, expect, test } from 'vitest'

import { renderPaymentConfirmed } from './confirmation.js'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('renderPaymentConfirmed', () => {
  test('renders the stored payment reference', () => {
    document.body.innerHTML =
      '<strong data-testid="payment-confirmed-reference"></strong>'
    renderPaymentConfirmed(document, {
      paymentReference: 'S185756-20260901120000'
    })

    expect(
      document.querySelector('[data-testid="payment-confirmed-reference"]')
        .textContent
    ).toBe('S185756-20260901120000')
  })

  test('renders empty when no reference is stored', () => {
    document.body.innerHTML =
      '<strong data-testid="payment-confirmed-reference">x</strong>'
    renderPaymentConfirmed(document, {})

    expect(
      document.querySelector('[data-testid="payment-confirmed-reference"]')
        .textContent
    ).toBe('')
  })
})
