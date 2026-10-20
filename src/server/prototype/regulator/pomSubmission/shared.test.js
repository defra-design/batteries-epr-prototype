import { nextPeriodLabel } from './shared.js'

describe('nextPeriodLabel', () => {
  test('moves to the next quarter in the same year', () => {
    expect(nextPeriodLabel('Q2', '2026')).toBe('Q3 2026')
  })

  test('Q4 rolls over to Q1 of the next year', () => {
    expect(nextPeriodLabel('Q4', '2025')).toBe('Q1 2026')
  })
})
