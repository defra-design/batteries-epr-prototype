// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { initDetail } from './index.js'
import seedData from '../../storage-seed.json'

const buildDom = ({ bprn, searchUrl = '/register/search' } = {}) => {
  document.body.innerHTML = `
    <div id="producer-detail"></div>
    <script id="page-payload" type="application/json">${JSON.stringify({ bprn, searchUrl })}</script>
  `
}

beforeEach(() => {
  globalThis.localStorage.clear()
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('initDetail', () => {
  test('renders the producer card for a known BPRN', () => {
    buildDom({ bprn: 'BPRN-EA-2026-000001' })
    const record = initDetail(document)

    expect(record).not.toBeNull()
    expect(record.companyName).toBe('Acme Batteries Ltd')
    expect(
      document.querySelector('[data-testid="producer-detail-card"]')
    ).not.toBeNull()
    expect(
      document.querySelector('[data-testid="producer-detail-name"]').textContent
    ).toBe('Acme Batteries Ltd')
    expect(
      document.querySelector('[data-testid="producer-detail-bprn"]').textContent
    ).toBe('BPRN-EA-2026-000001')
  })

  test('renders the not-found partial for an unknown BPRN', () => {
    buildDom({ bprn: 'BPRN-FAKE-9999-999999' })
    const record = initDetail(document)

    expect(record).toBeNull()
    expect(
      document.querySelector('[data-testid="producer-detail-not-found"]')
    ).not.toBeNull()
    expect(
      document.querySelector('[data-testid="producer-detail-not-found"]')
        .textContent
    ).toContain('BPRN-FAKE-9999-999999')
  })

  test('renders not-found when no BPRN is provided in the payload', () => {
    buildDom({ bprn: '' })
    const record = initDetail(document)

    expect(record).toBeNull()
    expect(
      document.querySelector('[data-testid="producer-detail-not-found"]')
    ).not.toBeNull()
  })

  test('returns null when the container element is missing', () => {
    document.body.innerHTML = `<script id="page-payload" type="application/json">{"bprn":"BPRN-EA-2026-000001"}</script>`
    expect(initDetail(document)).toBeNull()
  })

  test('falls back to the default search URL when payload omits it', () => {
    document.body.innerHTML = `
      <div id="producer-detail"></div>
      <script id="page-payload" type="application/json">{"bprn":"NONE"}</script>
    `
    initDetail(document)
    const link = document.querySelector(
      '[data-testid="producer-detail-not-found"] a'
    )
    expect(link.getAttribute('href')).toBe('/register/search')
  })

  test('falls back to empty BPRN when there is no payload at all', () => {
    document.body.innerHTML = `<div id="producer-detail"></div>`
    expect(initDetail(document)).toBeNull()
    expect(
      document.querySelector('[data-testid="producer-detail-not-found"]')
    ).not.toBeNull()
  })

  test('renders "None" for brandNames when the producer has none recorded', () => {
    globalThis.localStorage.setItem(
      'npwd-batteries:producers',
      JSON.stringify({
        'plain@example.com': {
          id: 'plain',
          version: 0,
          bprn: 'BPRN-EA-2026-099005',
          contactEmail: 'plain@example.com',
          companyName: 'Plain Co',
          registeredAddress: { line1: '1', town: 'X', postcode: 'X8' },
          batteryTypes: { isPortable: true },
          brandNames: null,
          status: 'Approved'
        }
      })
    )
    globalThis.localStorage.setItem(
      'npwd-batteries:seed-version',
      String(seedData.seedVersion)
    )
    buildDom({ bprn: 'BPRN-EA-2026-099005' })

    initDetail(document)
    const html = document.querySelector(
      '[data-testid="producer-detail-card"]'
    ).innerHTML
    expect(html).toContain('>None<')
  })
})
