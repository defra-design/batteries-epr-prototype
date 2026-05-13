// @vitest-environment jsdom
import { describe, expect, test } from 'vitest'

import { escape, formatAddress, formatBatteryTypes } from './render-helpers.js'

describe('escape', () => {
  test('escapes the five HTML metacharacters', () => {
    expect(escape('<script>')).toBe('&lt;script&gt;')
    expect(escape('"\'&')).toBe('&quot;&#39;&amp;')
  })

  test('coerces null and undefined to an empty string', () => {
    expect(escape(null)).toBe('')
    expect(escape(undefined)).toBe('')
  })

  test('returns the input unchanged when it has no metacharacters', () => {
    expect(escape('plain text')).toBe('plain text')
  })
})

describe('formatBatteryTypes', () => {
  test('lists the three flags in order', () => {
    expect(
      formatBatteryTypes({
        isPortable: true,
        isIndustrial: true,
        isAutomotive: true
      })
    ).toBe('Portable, Industrial, Automotive')
  })

  test('returns "None declared" when nothing is set', () => {
    expect(formatBatteryTypes({})).toBe('None declared')
  })

  test('handles a single flag', () => {
    expect(formatBatteryTypes({ isAutomotive: true })).toBe('Automotive')
  })
})

describe('formatAddress', () => {
  test('joins non-empty address lines with commas', () => {
    expect(
      formatAddress({
        line1: '1 Test St',
        line2: null,
        line3: null,
        line4: null,
        town: 'Test',
        postcode: 'TS1 1AA'
      })
    ).toBe('1 Test St, Test, TS1 1AA')
  })

  test('returns an empty string when there is no address', () => {
    expect(formatAddress(null)).toBe('')
  })

  test('handles an address with all four optional lines populated', () => {
    expect(
      formatAddress({
        line1: 'A',
        line2: 'B',
        line3: 'C',
        line4: 'D',
        town: 'T',
        postcode: 'P1'
      })
    ).toBe('A, B, C, D, T, P1')
  })
})
