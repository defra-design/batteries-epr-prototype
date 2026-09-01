// @vitest-environment jsdom
import { afterEach, describe, expect, test } from 'vitest'

import { fakeAddressesFor, wireAddressLookup } from './address-lookup.js'

const formHtml = (postcode) => `
  <form>
    <input data-testid="details-postcode" value="${postcode}">
    <button data-testid="details-find-address" type="button"></button>
    <div data-testid="details-address-select-wrapper" hidden>
      <select data-testid="details-address-select"></select>
    </div>
    <a data-testid="details-manual-link" href="#"></a>
    <div data-testid="details-manual-address" hidden>
      <input data-testid="details-address-line1">
      <input data-testid="details-address-town">
    </div>
  </form>
`

afterEach(() => {
  document.body.innerHTML = ''
})

describe('wireAddressLookup', () => {
  test('returns false when the find button is absent', () => {
    document.body.innerHTML = '<form></form>'
    expect(wireAddressLookup(document)).toBe(false)
  })

  test('does nothing when the postcode is empty', () => {
    document.body.innerHTML = formHtml('')
    wireAddressLookup(document)

    document.querySelector('[data-testid="details-find-address"]').click()

    expect(
      document.querySelector('[data-testid="details-address-select-wrapper"]')
        .hidden
    ).toBe(true)
  })

  test('populates the select and applies the first address', () => {
    document.body.innerHTML = formHtml('LS1 4DP')
    expect(wireAddressLookup(document)).toBe(true)

    document.querySelector('[data-testid="details-find-address"]').click()

    const select = document.querySelector(
      '[data-testid="details-address-select"]'
    )
    expect(select.options.length).toBe(fakeAddressesFor('LS1 4DP').length)
    expect(
      document.querySelector('[data-testid="details-address-line1"]').value
    ).toBe('2 Elm Court, Riverside Way')
    expect(
      document.querySelector('[data-testid="details-address-town"]').value
    ).toBe('Leeds')

    select.value = '1'
    select.onchange()
    expect(
      document.querySelector('[data-testid="details-address-line1"]').value
    ).toBe('14 Harbour Street')
  })

  test('reveals the manual address fields from the manual link', () => {
    document.body.innerHTML = formHtml('LS1 4DP')
    wireAddressLookup(document)

    document.querySelector('[data-testid="details-manual-link"]').click()

    expect(
      document.querySelector('[data-testid="details-manual-address"]').hidden
    ).toBe(false)
  })
})
