import { describe, expect, test } from 'vitest'

import { lookupCompany } from './companies-house-stub.js'

describe('lookupCompany', () => {
  test('returns the matching record for a known number', () => {
    const record = lookupCompany('12345678')
    expect(record).not.toBeNull()
    expect(record.companyName).toBe('Demo Power Cells Ltd')
  })

  test('returns null for an unknown but well-formed number', () => {
    expect(lookupCompany('99999999')).toBeNull()
  })

  test('returns null for malformed input', () => {
    expect(lookupCompany('123')).toBeNull()
    expect(lookupCompany('abc')).toBeNull()
    expect(lookupCompany(null)).toBeNull()
  })

  test('trims surrounding whitespace before matching', () => {
    expect(lookupCompany('  12345678  ').companyName).toBe(
      'Demo Power Cells Ltd'
    )
  })
})
