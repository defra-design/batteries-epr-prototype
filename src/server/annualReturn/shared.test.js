import { describe, expect, test } from 'vitest'

import { collectErrors, errorListToMap } from './shared.js'

describe('annualReturn shared helpers', () => {
  test('errorListToMap converts an array to a {field: text} map', () => {
    expect(
      errorListToMap([
        { text: 'A', href: '#alpha' },
        { text: 'B', href: '#beta' }
      ])
    ).toEqual({ alpha: 'A', beta: 'B' })
  })

  test('errorListToMap handles a null input', () => {
    expect(errorListToMap(null)).toEqual({})
  })

  test('collectErrors maps known fields, dedupes, and skips unknowns', () => {
    const list = collectErrors(
      {
        details: [
          { path: ['firstName'] },
          { path: ['firstName'] },
          { path: ['unknown'] },
          { path: ['lastName'] }
        ]
      },
      { firstName: 'F required', lastName: 'L required' }
    )
    expect(list).toEqual([
      { text: 'F required', href: '#firstName' },
      { text: 'L required', href: '#lastName' }
    ])
  })
})
