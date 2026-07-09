import { describe, expect, test } from 'vitest'

import { paths } from '../../../config/paths.js'
import {
  collectErrors,
  errorListToMap,
  flashErrors,
  nextStepPath,
  readData,
  readErrors,
  saveData
} from './shared.js'

const makeRequest = () => {
  const store = new Map()
  const flashes = new Map()
  return {
    yar: {
      get: (key) => store.get(key),
      set: (key, value) => store.set(key, value),
      flash: (key, value) => {
        if (value === undefined) {
          const out = flashes.get(key) ?? []
          flashes.delete(key)
          return out
        }
        const arr = (flashes.get(key) ?? []).concat(value)
        flashes.set(key, arr)
        return arr
      }
    }
  }
}

describe('ni onboarding shared', () => {
  test('nextStepPath returns the following step path', () => {
    expect(nextStepPath('companyDetails')).toBe(
      paths.niOnboardingContactDetails
    )
  })

  test('nextStepPath returns the dashboard for the final step', () => {
    expect(nextStepPath('confirmation')).toBe(paths.niDashboard)
  })

  test('readData defaults to an empty object', () => {
    expect(readData(makeRequest())).toEqual({})
  })

  test('saveData merges patches and persists them', () => {
    const request = makeRequest()
    saveData(request, { a: 1 })
    const merged = saveData(request, { b: 2 })
    expect(merged).toEqual({ a: 1, b: 2 })
    expect(readData(request)).toEqual({ a: 1, b: 2 })
  })

  test('flashErrors then readErrors round-trips the summary and values', () => {
    const request = makeRequest()
    flashErrors(request, 'companyDetails', [{ text: 'x', href: '#x' }], {
      x: '1'
    })
    expect(readErrors(request, 'companyDetails')).toEqual({
      errorSummary: [{ text: 'x', href: '#x' }],
      values: { x: '1' }
    })
  })

  test('readErrors with no flash returns an empty summary and null values', () => {
    expect(readErrors(makeRequest(), 'companyDetails')).toEqual({
      errorSummary: [],
      values: null
    })
  })

  test('errorListToMap maps fields and handles null', () => {
    expect(errorListToMap([{ text: 'A', href: '#alpha' }])).toEqual({
      alpha: 'A'
    })
    expect(errorListToMap(null)).toEqual({})
  })

  test('collectErrors maps known fields, dedupes and skips unknowns', () => {
    const joiError = {
      details: [
        { path: ['firstName'] },
        { path: ['firstName'] },
        { path: ['unknown'] },
        { path: ['lastName'] }
      ]
    }
    expect(
      collectErrors(joiError, { firstName: 'First', lastName: 'Last' })
    ).toEqual([
      { text: 'First', href: '#firstName' },
      { text: 'Last', href: '#lastName' }
    ])
  })
})
