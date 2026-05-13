import { describe, expect, test } from 'vitest'

import { content } from './content.js'

const englishRequest = { headers: { 'x-language': 'en' } }
const welshRequest = { headers: { 'x-language': 'cy' } }

const pageKeys = Object.keys(content)

describe('content registry', () => {
  test('exposes a function for every known page', () => {
    expect(pageKeys.length).toBeGreaterThan(20)
    for (const key of pageKeys) {
      expect(typeof content[key]).toBe('function')
    }
  })

  test('every page returns an object for English', () => {
    for (const key of pageKeys) {
      const result = content[key](englishRequest)
      expect(result).toBeTypeOf('object')
      expect(result).not.toBeNull()
    }
  })

  test('every page returns an object for Welsh (stubs)', () => {
    for (const key of pageKeys) {
      const result = content[key](welshRequest)
      expect(result).toBeTypeOf('object')
      expect(result).not.toBeNull()
    }
  })

  test('every page exposes a defined heading in both languages', () => {
    for (const key of pageKeys) {
      const en = content[key](englishRequest)
      const cy = content[key](welshRequest)
      expect(en.heading).toBeDefined()
      expect(cy.heading).toBeDefined()
    }
  })

  test('defaults to English when no language header is present', () => {
    const result = content.home({})
    expect(result.title).toBe(content.home(englishRequest).title)
  })

  test('defaults to English when request is undefined', () => {
    const result = content.home()
    expect(result.title).toBe(content.home(englishRequest).title)
  })
})
