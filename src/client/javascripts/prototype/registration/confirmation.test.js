// @vitest-environment jsdom
import { afterEach, describe, expect, test } from 'vitest'

import { renderConfirmation } from './confirmation.js'

const buildPanel = () => {
  document.body.innerHTML = `
    <h1 data-testid="complete-panel-title">Registration request received</h1>
    <div data-testid="complete-panel-body"><strong data-testid="complete-bprn"></strong></div>
    <span data-testid="complete-email"></span>
    <li data-testid="complete-bprn-bullet"></li>
  `
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('renderConfirmation', () => {
  test('shows the BPRN panel for a directly registered producer', () => {
    buildPanel()
    const outcome = renderConfirmation(document, {
      bprn: 'BPR00234567',
      appropriatePersonEmail: 'scarlet@batteryproducer.co.uk'
    })

    expect(outcome).toBe('bprn')
    expect(
      document.querySelector('[data-testid="complete-bprn"]').textContent
    ).toBe('BPR00234567')
    expect(
      document.querySelector('[data-testid="complete-email"]').textContent
    ).toBe('scarlet@batteryproducer.co.uk')
    expect(
      document.querySelector('[data-testid="complete-panel-body"]').hidden
    ).toBe(false)
  })

  test('shows the application submitted variant when no BPRN was allocated', () => {
    buildPanel()
    const outcome = renderConfirmation(document, {})

    expect(outcome).toBe('submitted')
    expect(
      document.querySelector('[data-testid="complete-panel-title"]').textContent
    ).toBe('Application submitted')
    expect(
      document.querySelector('[data-testid="complete-panel-body"]').hidden
    ).toBe(true)
    expect(
      document.querySelector('[data-testid="complete-bprn-bullet"]').hidden
    ).toBe(true)
    expect(
      document.querySelector('[data-testid="complete-email"]').textContent
    ).toBe('')
  })
})
