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

describe('ni annual return shared', () => {
  test('nextStepPath returns the following step path', () => {
    expect(nextStepPath('categories')).toBe(paths.niAnnualReturnPlaced)
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
    expect(saveData(request, { b: 2 })).toEqual({ a: 1, b: 2 })
  })

  test('flashErrors then readErrors round-trips, empty otherwise', () => {
    const request = makeRequest()
    flashErrors(request, 'categories', [{ text: 'x', href: '#x' }], { x: '1' })
    expect(readErrors(request, 'categories')).toEqual({
      errorSummary: [{ text: 'x', href: '#x' }],
      values: { x: '1' }
    })
    expect(readErrors(makeRequest(), 'categories')).toEqual({
      errorSummary: [],
      values: null
    })
  })

  test('re-exported helpers from the onboarding module work', () => {
    expect(errorListToMap(null)).toEqual({})
    expect(collectErrors({ details: [{ path: ['a'] }] }, { a: 'A' })).toEqual([
      { text: 'A', href: '#a' }
    ])
  })
})
