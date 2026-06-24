// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import {
  NI_STORAGE_KEYS,
  getAnnualReturn,
  getRegistration,
  listAnnualReturns,
  readJsonScript,
  saveAnnualReturn,
  saveRegistration,
  storage
} from './storage.js'

beforeEach(() => {
  globalThis.localStorage.clear()
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('ni storage — registration', () => {
  test('saveRegistration creates a stamped record with an id', () => {
    const saved = saveRegistration({ bprn: 'NIP1234567', period: '2026' })

    expect(saved.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(saved.bprn).toBe('NIP1234567')
    expect(saved.version).toBe(0)
    expect(saved.createdAt).toEqual(expect.any(String))
    expect(saved.updatedAt).toEqual(expect.any(String))
  })

  test('saveRegistration merges into and re-stamps the existing record', () => {
    const first = saveRegistration({ bprn: 'NIP1234567', status: 'Registered' })
    const second = saveRegistration({ status: 'Updated' })

    expect(second.id).toBe(first.id)
    expect(second.bprn).toBe('NIP1234567')
    expect(second.status).toBe('Updated')
    expect(second.version).toBe(1)
    expect(second.createdAt).toBe(first.createdAt)
  })

  test('getRegistration returns null when nothing is stored', () => {
    expect(getRegistration()).toBeNull()
  })

  test('getRegistration returns the stored record', () => {
    saveRegistration({ bprn: 'NIP7654321' })
    expect(getRegistration().bprn).toBe('NIP7654321')
  })
})

describe('ni storage — annual returns', () => {
  test('saveAnnualReturn stores a return keyed by period', () => {
    const saved = saveAnnualReturn({ period: '2026', reference: 'NI-AR-100001' })

    expect(saved.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(saved.version).toBe(0)
    expect(getAnnualReturn('2026').reference).toBe('NI-AR-100001')
  })

  test('saveAnnualReturn keeps multiple periods and re-stamps a re-save', () => {
    saveAnnualReturn({ period: '2025', reference: 'NI-AR-100001' })
    saveAnnualReturn({ period: '2026', reference: 'NI-AR-100002' })
    const resaved = saveAnnualReturn({ period: '2026', reference: 'NI-AR-100003' })

    expect(resaved.version).toBe(1)
    expect(listAnnualReturns()).toHaveLength(2)
    expect(getAnnualReturn('2026').reference).toBe('NI-AR-100003')
  })

  test('listAnnualReturns is empty when nothing is stored', () => {
    expect(listAnnualReturns()).toEqual([])
  })

  test('getAnnualReturn returns null when nothing is stored', () => {
    expect(getAnnualReturn('2026')).toBeNull()
  })

  test('getAnnualReturn returns null for an unknown period', () => {
    saveAnnualReturn({ period: '2026', reference: 'NI-AR-100001' })
    expect(getAnnualReturn('2030')).toBeNull()
  })
})

describe('ni storage — readJsonScript', () => {
  test('returns null when the element is missing', () => {
    expect(readJsonScript(globalThis.document, 'missing')).toBeNull()
  })

  test('parses valid JSON from the script element', () => {
    const script = globalThis.document.createElement('script')
    script.id = 'payload'
    script.type = 'application/json'
    script.textContent = JSON.stringify({ bprn: 'NIP1234567' })
    globalThis.document.body.appendChild(script)

    expect(readJsonScript(globalThis.document, 'payload')).toEqual({
      bprn: 'NIP1234567'
    })
  })

  test('returns null for malformed JSON', () => {
    const script = globalThis.document.createElement('script')
    script.id = 'broken'
    script.type = 'application/json'
    script.textContent = '{ not json'
    globalThis.document.body.appendChild(script)

    expect(readJsonScript(globalThis.document, 'broken')).toBeNull()
  })

  test('returns null for empty content', () => {
    const script = globalThis.document.createElement('script')
    script.id = 'empty'
    script.type = 'application/json'
    script.textContent = ''
    globalThis.document.body.appendChild(script)

    expect(readJsonScript(globalThis.document, 'empty')).toBeNull()
  })
})

describe('ni storage — bundled object', () => {
  test('exposes every helper', () => {
    expect(Object.keys(storage).sort()).toEqual(
      [
        'getAnnualReturn',
        'getRegistration',
        'listAnnualReturns',
        'readJsonScript',
        'saveAnnualReturn',
        'saveRegistration'
      ].sort()
    )
    expect(NI_STORAGE_KEYS.registration).toBe('ni-batteries:registration')
    expect(NI_STORAGE_KEYS.annualReturns).toBe('ni-batteries:annualReturns')
  })
})
