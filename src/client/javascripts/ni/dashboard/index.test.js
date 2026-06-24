// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { initNiDashboard } from './index.js'
import { saveAnnualReturn, saveRegistration } from '../storage.js'

const DASHBOARD_MARKUP = `
  <p data-ni-registration-status>No registration submitted yet.</p>
  <p data-ni-annual-returns-empty>No annual returns submitted yet.</p>
  <table data-ni-annual-returns-table hidden>
    <tbody data-ni-annual-returns-body></tbody>
  </table>
`

beforeEach(() => {
  globalThis.localStorage.clear()
  globalThis.document.body.innerHTML = DASHBOARD_MARKUP
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('initNiDashboard', () => {
  test('leaves the empty baseline when the store is empty', () => {
    initNiDashboard(globalThis.document)

    const status = globalThis.document.querySelector(
      '[data-ni-registration-status]'
    )
    const empty = globalThis.document.querySelector(
      '[data-ni-annual-returns-empty]'
    )
    const table = globalThis.document.querySelector(
      '[data-ni-annual-returns-table]'
    )

    expect(status.textContent).toContain('No registration')
    expect(empty.hidden).toBe(false)
    expect(table.hidden).toBe(true)
  })

  test('renders the registration and the annual returns from the store', () => {
    saveRegistration({ bprn: 'NIP1234567', period: '2026' })
    saveAnnualReturn({ period: '2026', reference: 'NI-AR-100001' })

    initNiDashboard(globalThis.document)

    const status = globalThis.document.querySelector(
      '[data-ni-registration-status]'
    )
    const empty = globalThis.document.querySelector(
      '[data-ni-annual-returns-empty]'
    )
    const table = globalThis.document.querySelector(
      '[data-ni-annual-returns-table]'
    )
    const rows = globalThis.document.querySelectorAll(
      '[data-ni-annual-returns-body] tr'
    )

    expect(status.textContent).toContain('NIP1234567')
    expect(status.textContent).toContain('2026')
    expect(empty.hidden).toBe(true)
    expect(table.hidden).toBe(false)
    expect(rows).toHaveLength(1)
    expect(rows[0].textContent).toContain('NI-AR-100001')
  })
})
