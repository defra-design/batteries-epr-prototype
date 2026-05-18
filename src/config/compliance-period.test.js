import { describe, expect, test } from 'vitest'

import {
  TIME_TRAVEL_COOKIE,
  getCompliancePeriod,
  getCurrentDate,
  getCurrentYear
} from './compliance-period.js'

const realYear = new Date().getUTCFullYear()

describe('compliance-period', () => {
  test('TIME_TRAVEL_COOKIE is tt-year', () => {
    expect(TIME_TRAVEL_COOKIE).toBe('tt-year')
  })

  test('getCurrentYear returns the real year when there is no request', () => {
    expect(getCurrentYear()).toBe(realYear)
  })

  test('getCurrentYear returns the real year when the cookie is absent', () => {
    expect(getCurrentYear({ state: {} })).toBe(realYear)
  })

  test('getCurrentYear returns the cookie year when set', () => {
    expect(getCurrentYear({ state: { 'tt-year': '2030' } })).toBe(2030)
  })

  test('getCurrentYear ignores out-of-range cookie values', () => {
    expect(getCurrentYear({ state: { 'tt-year': '1969' } })).toBe(realYear)
    expect(getCurrentYear({ state: { 'tt-year': '10000' } })).toBe(realYear)
  })

  test('getCurrentYear ignores non-numeric cookie values', () => {
    expect(getCurrentYear({ state: { 'tt-year': 'abc' } })).toBe(realYear)
  })

  test('getCurrentDate returns now when no cookie is set', () => {
    const before = Date.now()
    const result = getCurrentDate().getTime()
    const after = Date.now()
    expect(result).toBeGreaterThanOrEqual(before)
    expect(result).toBeLessThanOrEqual(after)
  })

  test('getCurrentDate shifts the year when the cookie is set', () => {
    const shifted = getCurrentDate({ state: { 'tt-year': '2030' } })
    expect(shifted.getUTCFullYear()).toBe(2030)
  })

  test('getCompliancePeriod returns the year as a string', () => {
    expect(getCompliancePeriod({ state: { 'tt-year': '2030' } })).toBe('2030')
    expect(getCompliancePeriod()).toBe(String(realYear))
  })
})
