// @vitest-environment jsdom
import { afterEach, describe, expect, test } from 'vitest'

import { unitSuffix, wireDataTotals } from './data-totals.js'

const formHtml = `
  <form>
    <input type="radio" name="unit" value="kilograms" checked>
    <input type="radio" name="unit" value="tonnes">
    <input name="weightLeadAcid">
    <input name="weightNickelCadmium">
    <input name="weightOther">
    <span class="govuk-input__suffix">kg</span>
    <span data-testid="data-total"></span>
  </form>
`

afterEach(() => {
  document.body.innerHTML = ''
})

describe('unitSuffix', () => {
  test('maps units to their display suffix', () => {
    expect(unitSuffix('kilograms')).toBe('kg')
    expect(unitSuffix('tonnes')).toBe('t')
    expect(unitSuffix(undefined)).toBe('kg')
  })
})

describe('wireDataTotals', () => {
  test('returns false when the total element is absent', () => {
    document.body.innerHTML = '<form></form>'
    expect(wireDataTotals(document)).toBe(false)
  })

  test('recomputes the running total as weights change', () => {
    document.body.innerHTML = formHtml
    expect(wireDataTotals(document)).toBe(true)

    const total = document.querySelector('[data-testid="data-total"]')
    expect(total.textContent).toBe('0kg')

    const leadAcid = document.querySelector('[name="weightLeadAcid"]')
    leadAcid.value = '45'
    leadAcid.dispatchEvent(new Event('input'))
    const other = document.querySelector('[name="weightOther"]')
    other.value = '50.5'
    other.dispatchEvent(new Event('input'))

    expect(total.textContent).toBe('95.5kg')
  })

  test('defaults to kilograms when no unit is selected', () => {
    document.body.innerHTML = `
      <form>
        <input name="weightLeadAcid" value="3">
        <input name="weightNickelCadmium">
        <input name="weightOther">
        <span data-testid="data-total"></span>
      </form>
    `
    wireDataTotals(document)

    expect(
      document.querySelector('[data-testid="data-total"]').textContent
    ).toBe('3kg')
  })

  test('switching unit updates the total suffix and input suffixes', () => {
    document.body.innerHTML = formHtml
    wireDataTotals(document)

    const tonnes = document.querySelector('input[value="tonnes"]')
    tonnes.checked = true
    tonnes.dispatchEvent(new Event('change'))

    expect(
      document.querySelector('[data-testid="data-total"]').textContent
    ).toBe('0t')
    expect(document.querySelector('.govuk-input__suffix').textContent).toBe('t')
  })
})
