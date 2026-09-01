// @vitest-environment jsdom
import { afterEach, describe, expect, test } from 'vitest'

import { renderAccountName } from './account.js'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('renderAccountName', () => {
  test('replaces the default company name with the registered organisation', () => {
    document.body.innerHTML =
      '<h1 data-testid="account-company-name">Default</h1>'

    expect(
      renderAccountName(document, { organisationName: 'Demo Power Cells Ltd' })
    ).toBe(true)
    expect(
      document.querySelector('[data-testid="account-company-name"]').textContent
    ).toBe('Demo Power Cells Ltd')
  })

  test('keeps the default when no organisation is registered', () => {
    document.body.innerHTML =
      '<h1 data-testid="account-company-name">Default</h1>'

    expect(renderAccountName(document, {})).toBe(false)
    expect(
      document.querySelector('[data-testid="account-company-name"]').textContent
    ).toBe('Default')
  })
})
