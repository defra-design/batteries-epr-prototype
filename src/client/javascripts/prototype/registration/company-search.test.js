// @vitest-environment jsdom
import { afterEach, describe, expect, test } from 'vitest'

import { wireCompanySearch } from './company-search.js'

const formHtml = (number) => `
  <form>
    <input data-testid="companies-house-name">
    <input data-testid="companies-house-number" value="${number}">
    <button data-testid="companies-house-search" type="button"></button>
    <div data-testid="companies-house-result" hidden>
      <p data-testid="companies-house-result-summary"></p>
    </div>
    <p data-testid="companies-house-not-found" hidden></p>
    <input type="hidden" data-testid="companies-house-address-line1">
    <input type="hidden" data-testid="companies-house-address-town">
    <input type="hidden" data-testid="companies-house-address-postcode">
  </form>
`

afterEach(() => {
  document.body.innerHTML = ''
})

describe('wireCompanySearch', () => {
  test('returns false when the search button is absent', () => {
    document.body.innerHTML = '<form></form>'
    expect(wireCompanySearch(document)).toBe(false)
  })

  test('fills the name, address fields and result summary for a known company', () => {
    document.body.innerHTML = formHtml('12345678')
    expect(wireCompanySearch(document)).toBe(true)

    document.querySelector('[data-testid="companies-house-search"]').click()

    expect(
      document.querySelector('[data-testid="companies-house-name"]').value
    ).toBe('Demo Power Cells Ltd')
    expect(
      document.querySelector('[data-testid="companies-house-address-line1"]')
        .value
    ).toBe('1 Demo Way')
    expect(
      document.querySelector('[data-testid="companies-house-address-postcode"]')
        .value
    ).toBe('M1 4AA')
    expect(
      document.querySelector('[data-testid="companies-house-result"]').hidden
    ).toBe(false)
    expect(
      document.querySelector('[data-testid="companies-house-result-summary"]')
        .textContent
    ).toContain('Manchester')
  })

  test('shows the not-found message for an unknown company number', () => {
    document.body.innerHTML = formHtml('99999999')
    wireCompanySearch(document)

    document.querySelector('[data-testid="companies-house-search"]').click()

    expect(
      document.querySelector('[data-testid="companies-house-not-found"]').hidden
    ).toBe(false)
    expect(
      document.querySelector('[data-testid="companies-house-result"]').hidden
    ).toBe(true)
  })
})
