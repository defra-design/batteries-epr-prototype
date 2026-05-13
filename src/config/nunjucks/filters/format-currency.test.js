import { formatCurrency } from './format-currency.js'

describe('formatCurrency', () => {
  test('formats GBP by default', () => {
    expect(formatCurrency(123.45)).toBe('£123.45')
  })

  test('accepts a different currency', () => {
    expect(formatCurrency(100, 'en-GB', 'USD')).toBe('US$100.00')
  })
})
