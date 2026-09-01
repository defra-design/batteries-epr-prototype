// @vitest-environment jsdom
import { afterEach, describe, expect, test } from 'vitest'

import { renderCheckData } from './check-data.js'

const rowsHtml = [
  'batteryTypes',
  'brandNames',
  'leadAcid',
  'nickelCadmium',
  'other',
  'total'
]
  .map((rowKey) => `<dd data-testid="check-data-value-${rowKey}"></dd>`)
  .join('')

const valueOf = (rowKey) =>
  document.querySelector(`[data-testid="check-data-value-${rowKey}"]`)
    .textContent

afterEach(() => {
  document.body.innerHTML = ''
})

describe('renderCheckData', () => {
  test('renders weights with the kilogram suffix and joined brand names', () => {
    document.body.innerHTML = rowsHtml
    renderCheckData(
      document,
      { isPortable: true },
      {
        hasBrand: 'yes',
        brandNames: ['Bunny Batteries', 'Power Paws'],
        unit: 'kilograms',
        weightLeadAcid: '45',
        weightNickelCadmium: '10',
        weightOther: '50'
      }
    )

    expect(valueOf('batteryTypes')).toBe('Portable batteries')
    expect(valueOf('brandNames')).toBe('Bunny Batteries, Power Paws')
    expect(valueOf('leadAcid')).toBe('45kg')
    expect(valueOf('total')).toBe('105kg')
  })

  test('renders tonnes, zeroes for blanks and None for producers without brands', () => {
    document.body.innerHTML = rowsHtml
    renderCheckData(
      document,
      {},
      { hasBrand: 'no', unit: 'tonnes', weightLeadAcid: '1.5' }
    )

    expect(valueOf('brandNames')).toBe('None')
    expect(valueOf('leadAcid')).toBe('1.5t')
    expect(valueOf('nickelCadmium')).toBe('0t')
    expect(valueOf('total')).toBe('1.5t')
  })

  test('dashes the brand row for a brand owner with no names stored yet', () => {
    document.body.innerHTML = rowsHtml
    renderCheckData(document, {}, { hasBrand: 'yes', weightNickelCadmium: '2' })

    expect(valueOf('brandNames')).toBe('—')
    expect(valueOf('leadAcid')).toBe('0kg')
    expect(valueOf('total')).toBe('2kg')
  })
})
