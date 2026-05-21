// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { installShim } from './index.js'

const KEY = 'npwd-batteries:time-travel-target-year'

let OriginalDate

beforeEach(() => {
  OriginalDate = globalThis.Date
  globalThis.localStorage.clear()
})

afterEach(() => {
  globalThis.Date = OriginalDate
  globalThis.localStorage.clear()
})

describe('installShim', () => {
  test('returns null when no target year is stored', () => {
    expect(installShim()).toBeNull()
    expect(globalThis.Date).toBe(OriginalDate)
  })

  test('returns null when the stored value is non-integer', () => {
    globalThis.localStorage.setItem(KEY, 'banana')
    expect(installShim()).toBeNull()
  })

  test('returns null when the stored value is empty', () => {
    globalThis.localStorage.setItem(KEY, '')
    expect(installShim()).toBeNull()
  })

  test('returns null when the target year matches the current real year', () => {
    const realYear = new OriginalDate(OriginalDate.now()).getUTCFullYear()
    globalThis.localStorage.setItem(KEY, String(realYear))
    expect(installShim()).toBeNull()
    expect(globalThis.Date).toBe(OriginalDate)
  })

  test('patches Date so new Date() reports the target year', () => {
    const realYear = new OriginalDate(OriginalDate.now()).getUTCFullYear()
    const target = realYear + 5
    globalThis.localStorage.setItem(KEY, String(target))

    installShim()

    expect(new globalThis.Date().getUTCFullYear()).toBe(target)
  })

  test('Date.now() returns shifted milliseconds', () => {
    const realYear = new OriginalDate(OriginalDate.now()).getUTCFullYear()
    globalThis.localStorage.setItem(KEY, String(realYear + 2))

    installShim()

    const shifted = globalThis.Date.now()
    expect(new OriginalDate(shifted).getUTCFullYear()).toBe(realYear + 2)
  })

  test('explicit Date(args) is unshifted', () => {
    const realYear = new OriginalDate(OriginalDate.now()).getUTCFullYear()
    globalThis.localStorage.setItem(KEY, String(realYear + 5))

    installShim()

    const explicit = new globalThis.Date('2020-06-15T00:00:00Z')
    expect(explicit.getUTCFullYear()).toBe(2020)
  })

  test('called as a function returns a string with the shifted year', () => {
    const realYear = new OriginalDate(OriginalDate.now()).getUTCFullYear()
    globalThis.localStorage.setItem(KEY, String(realYear + 3))

    installShim()

    const result = globalThis.Date()
    expect(typeof result).toBe('string')
    expect(result).toContain(String(realYear + 3))
  })

  test('Date.UTC and Date.parse remain functional', () => {
    const realYear = new OriginalDate(OriginalDate.now()).getUTCFullYear()
    globalThis.localStorage.setItem(KEY, String(realYear + 1))

    installShim()

    expect(globalThis.Date.UTC(2020, 0, 1)).toBe(OriginalDate.UTC(2020, 0, 1))
    expect(globalThis.Date.parse('2020-01-01T00:00:00Z')).toBe(
      OriginalDate.parse('2020-01-01T00:00:00Z')
    )
  })
})
