// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { initDetail } from './index.js'
import { storage } from '../../storage-adapter.js'
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

  test('renders the compliance scheme section for a scheme-represented producer', () => {
    const scheme = storage.saveScheme({
      name: 'Detail Display Scheme',
      operator: 'Display Op',
      approvalNumber: 'BCS/2026/123',
      approvalStatus: 'approved'
    })
    storage.saveProducer({
      contactEmail: 'sd@x.com',
      companyName: 'SD Producer',
      bprn: 'BPRN-EA-2026-099333',
      status: 'Approved'
    })
    const producer = storage.getProducerByEmail('sd@x.com')
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      producerRoute: 'complianceScheme',
      schemeId: scheme.id
    })

    buildDom({ bprn: 'BPRN-EA-2026-099333' })
    initDetail(document)
    expect(
      document.querySelector('[data-testid="producer-detail-scheme-name"]')
        .textContent
    ).toBe('Detail Display Scheme')
    expect(
      document.querySelector('[data-testid="producer-detail-scheme-operator"]')
        .textContent
    ).toBe('Display Op')
    expect(
      document.querySelector(
        '[data-testid="producer-detail-scheme-approval-number"]'
      ).textContent
    ).toBe('BCS/2026/123')
  })

  test('omits the compliance scheme section for direct registrants', () => {
    buildDom({ bprn: 'BPRN-EA-2026-000001' })
    initDetail(document)
    expect(
      document.querySelector('[data-testid="producer-detail-scheme-heading"]')
    ).toBeNull()
  })

  test('renders em-dash placeholders for scheme operator and approval number when null', () => {
    const scheme = storage.saveScheme({
      name: 'Bare Scheme',
      operator: null,
      approvalNumber: null,
      approvalStatus: 'approved'
    })
    storage.saveProducer({
      contactEmail: 'bare@x.com',
      companyName: 'Bare Producer',
      bprn: 'BPRN-EA-2026-099222',
      status: 'Approved'
    })
    const producer = storage.getProducerByEmail('bare@x.com')
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      producerRoute: 'complianceScheme',
      schemeId: scheme.id
    })

    buildDom({ bprn: 'BPRN-EA-2026-099222' })
    initDetail(document)
    expect(
      document.querySelector('[data-testid="producer-detail-scheme-operator"]')
        .textContent
    ).toBe('—')
    expect(
      document.querySelector(
        '[data-testid="producer-detail-scheme-approval-number"]'
      ).textContent
    ).toBe('—')
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
