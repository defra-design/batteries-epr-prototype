import { postcodeToAgency } from './postcode-to-agency.js'

describe('postcodeToAgency', () => {
  test.each([
    ['BT1 1AA', 'NIEA'],
    ['bt7 3az', 'NIEA'],
    ['BT483PR', 'NIEA']
  ])('Northern Ireland postcode %s → NIEA', (input, expected) => {
    expect(postcodeToAgency(input)).toBe(expected)
  })

  test.each([
    ['EH1 1YZ', 'SEPA'],
    ['G1 2AA', 'SEPA'],
    ['AB10 1XG', 'SEPA'],
    ['IV30 1AA', 'SEPA'],
    ['DG1 2DA', 'SEPA'],
    ['ZE1 0AA', 'SEPA']
  ])('Scottish postcode %s → SEPA', (input, expected) => {
    expect(postcodeToAgency(input)).toBe(expected)
  })

  test.each([
    ['CF10 1EP', 'NRW'],
    ['LL57 2DG', 'NRW'],
    ['SA1 4QQ', 'NRW'],
    ['NP10 8XQ', 'NRW']
  ])('Welsh postcode %s → NRW', (input, expected) => {
    expect(postcodeToAgency(input)).toBe(expected)
  })

  test.each([
    ['SW1A 1AA', 'EA'],
    ['M1 1AA', 'EA'],
    ['B33 8TH', 'EA'],
    ['LS1 4AB', 'EA']
  ])('English postcode %s → EA', (input, expected) => {
    expect(postcodeToAgency(input)).toBe(expected)
  })

  test('does not match SAU as NRW (must be followed by a digit)', () => {
    expect(postcodeToAgency('SAU1 1AA')).toBe('EA')
  })

  test('handles undefined and null gracefully', () => {
    expect(postcodeToAgency(undefined)).toBe('EA')
    expect(postcodeToAgency(null)).toBe('EA')
    expect(postcodeToAgency('')).toBe('EA')
  })

  test('matches when the prefix is the entire postcode', () => {
    expect(postcodeToAgency('BT')).toBe('NIEA')
    expect(postcodeToAgency('CF')).toBe('NRW')
  })
})
