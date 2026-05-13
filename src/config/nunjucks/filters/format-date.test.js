import { formatDate } from './format-date.js'

describe('formatDate', () => {
  test('formats an ISO string with default format', () => {
    expect(formatDate('2026-04-30T00:00:00Z')).toBe('Thu 30th April 2026')
  })

  test('accepts a Date instance', () => {
    expect(formatDate(new Date('2026-04-30T00:00:00Z'))).toBe(
      'Thu 30th April 2026'
    )
  })

  test('honours a custom format', () => {
    expect(formatDate('2026-04-30T00:00:00Z', 'yyyy-MM-dd')).toBe('2026-04-30')
  })
})
