import * as filters from './filters.js'

describe('filters', () => {
  test('exports the expected filter set', () => {
    expect(typeof filters.assign).toBe('function')
    expect(typeof filters.formatDate).toBe('function')
    expect(typeof filters.formatCurrency).toBe('function')
  })
})
