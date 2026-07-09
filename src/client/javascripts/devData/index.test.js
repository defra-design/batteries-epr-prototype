// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { initDevData } from './index.js'
import { STORAGE_KEYS } from '../storage-adapter.js'
import { NI_STORAGE_KEYS } from '../ni/storage.js'

beforeEach(() => {
  globalThis.localStorage.clear()
  globalThis.document.body.innerHTML = '<div data-dev-data-root></div>'
})

afterEach(() => {
  globalThis.localStorage.clear()
})

const root = () => globalThis.document.querySelector('[data-dev-data-root]')
const entity = (key) =>
  globalThis.document.querySelector(`[data-dev-entity="${key}"]`)

describe('initDevData', () => {
  test('renders a collapsible section for every journey', () => {
    initDevData(globalThis.document)

    const journeys = Array.from(root().querySelectorAll('[data-dev-journey]'))
    expect(journeys).toHaveLength(6)
    expect(journeys.every((node) => node.tagName === 'DETAILS')).toBe(true)
    const names = journeys.map((node) => node.getAttribute('data-dev-journey'))
    expect(names).toContain('Producer (GB)')
    expect(names).toContain('Northern Ireland (EUBR)')
  })

  test('copies a record as JSON when the copy button is clicked', () => {
    const writeText = vi.fn()
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    globalThis.localStorage.setItem(
      STORAGE_KEYS.producers,
      JSON.stringify({ p1: { id: 'p1', bprn: 'NIP1' } })
    )

    initDevData(globalThis.document)
    globalThis.document.querySelector('[data-dev-copy="p1"]').click()

    expect(writeText).toHaveBeenCalledWith(
      JSON.stringify({ id: 'p1', bprn: 'NIP1' }, null, 2)
    )
    vi.unstubAllGlobals()
  })

  test('renders a map record with its schema and friendly field values', () => {
    globalThis.localStorage.setItem(
      STORAGE_KEYS.producers,
      JSON.stringify({
        p1: {
          id: 'p1',
          bprn: 'NIP1',
          contactEmail: null,
          brandNames: ['Acme'],
          registeredAddress: { line1: '1 Test St' },
          status: 'Active',
          version: 0
        }
      })
    )

    initDevData(globalThis.document)

    const section = entity(STORAGE_KEYS.producers)
    expect(section.querySelector('h3').textContent).toContain('Producers')
    expect(section.querySelector('h3').textContent).toContain('(1)')

    const schema = section.querySelector('table')
    expect(schema.textContent).toContain('brandNames')
    expect(schema.textContent).toContain('array')

    const record = section.querySelector('details')
    expect(record.querySelector('summary').textContent).toBe('p1')
    expect(record.textContent).toContain('Active')
    expect(record.querySelector('pre')).not.toBeNull()
    expect(record.textContent).toContain('1 Test St')
  })

  test('renders a scalar value and a single object with no schema', () => {
    globalThis.localStorage.setItem(STORAGE_KEYS.seedVersion, '3')
    globalThis.localStorage.setItem(
      STORAGE_KEYS.currentUser,
      JSON.stringify({ email: 'a@b.com' })
    )

    initDevData(globalThis.document)

    const scalar = entity(STORAGE_KEYS.seedVersion)
    expect(scalar.querySelector('table')).toBeNull()
    expect(scalar.textContent).toContain('3')

    const user = entity(STORAGE_KEYS.currentUser)
    expect(user.querySelector('table')).toBeNull()
    expect(user.textContent).toContain('a@b.com')
  })

  test('renders the NI registration single record with its schema', () => {
    globalThis.localStorage.setItem(
      NI_STORAGE_KEYS.registration,
      JSON.stringify({ bprn: 'NIP1000001', period: '2026', version: 0 })
    )

    initDevData(globalThis.document)

    const section = entity(NI_STORAGE_KEYS.registration)
    expect(section.querySelector('table')).not.toBeNull()
    expect(section.textContent).toContain('NIP1000001')
  })

  test('shows "No records stored" for empty and corrupt entities', () => {
    globalThis.localStorage.setItem(STORAGE_KEYS.schemes, 'not valid json')

    initDevData(globalThis.document)

    expect(entity(STORAGE_KEYS.payments).textContent).toContain(
      'No records stored.'
    )
    expect(entity(STORAGE_KEYS.schemes).textContent).toContain(
      'No records stored.'
    )
  })
})
