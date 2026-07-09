// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { initSearch, prefillForm, renderSearchResults } from './index.js'
import { storage } from '../../storage-adapter.js'
import seedData from '../../storage-seed.json'

const buildDom = (search = '') => {
  document.body.innerHTML = `
    <form id="public-register-search">
      <input name="q" />
      <input name="bprn" />
      <input name="postcode" />
    </form>
    <div id="register-results"></div>
    <script id="page-payload" type="application/json">{"detailUrlTemplate":"/register/{bprn}"}</script>
  `
  Object.defineProperty(globalThis, 'location', {
    value: { search },
    writable: true,
    configurable: true
  })
}

beforeEach(() => {
  globalThis.localStorage.clear()
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('renderSearchResults', () => {
  test('seeds demo data and renders all approved producers on first run', () => {
    buildDom('')
    const result = renderSearchResults(
      document,
      { page: 1 },
      '/register/{bprn}'
    )

    expect(result.totalCount).toBeGreaterThan(0)
    const rows = document.querySelectorAll('[data-testid="register-result"]')
    expect(rows).toHaveLength(result.items.length)
    expect(
      document.querySelector('[data-testid="register-result-count"]')
    ).not.toBeNull()
  })

  test('renders a "no results" message when filter excludes everything', () => {
    buildDom('')
    renderSearchResults(
      document,
      { q: 'zzzz-no-such-company', page: 1 },
      '/register/{bprn}'
    )
    expect(
      document.querySelector('[data-testid="register-no-results"]')
    ).not.toBeNull()
  })

  test('renders pagination with previous/next when totalPages > 1', () => {
    buildDom('')
    renderSearchResults(document, { page: 1 }, '/register/{bprn}')
    expect(
      document.querySelector('[data-testid="pagination-next"]')
    ).not.toBeNull()
  })

  test('renders previous link when on a later page', () => {
    buildDom('')
    renderSearchResults(document, { page: 2 }, '/register/{bprn}')
    expect(
      document.querySelector('[data-testid="pagination-previous"]')
    ).not.toBeNull()
  })

  test('result links include the BPRN-resolved detail URL', () => {
    buildDom('')
    renderSearchResults(document, { page: 1 }, '/register/{bprn}')
    const firstLink = document.querySelector(
      '[data-testid="register-result-link"]'
    )
    expect(firstLink.getAttribute('href')).toMatch(/\/register\/BPRN-/)
  })

  test('result rows include a Represented by column with — for direct registrants', () => {
    buildDom('')
    renderSearchResults(document, { page: 1 }, '/register/{bprn}')
    const repCells = document.querySelectorAll(
      '[data-testid="register-result-represented-by"]'
    )
    expect(repCells.length).toBeGreaterThan(0)
    expect(repCells[0].textContent).toBe('—')
  })

  test('result rows show the scheme name for scheme-represented producers', () => {
    buildDom('')
    const scheme = storage.saveScheme({
      name: 'Visible Scheme',
      approvalStatus: 'approved'
    })
    storage.saveProducer({
      contactEmail: 'visible@x.com',
      companyName: 'AAA Visible Producer',
      bprn: 'BPRN-EA-2026-099500',
      status: 'Approved'
    })
    const producer = storage.getProducerByEmail('visible@x.com')
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      producerRoute: 'complianceScheme',
      schemeId: scheme.id
    })
    renderSearchResults(document, { q: 'Visible', page: 1 }, '/register/{bprn}')
    const repCells = document.querySelectorAll(
      '[data-testid="register-result-represented-by"]'
    )
    expect(repCells[0].textContent).toBe('Visible Scheme')
  })

  test('returns the search result without a container present', () => {
    buildDom('')
    document.getElementById('register-results').remove()
    const result = renderSearchResults(
      document,
      { page: 1 },
      '/register/{bprn}'
    )
    expect(result).toHaveProperty('totalCount')
  })

  test('battery types render as a friendly comma-separated list', () => {
    buildDom('')
    renderSearchResults(
      document,
      { q: 'red willow', page: 1 },
      '/register/{bprn}'
    )
    const html = document.querySelector(
      '[data-testid="register-results-list"]'
    ).innerHTML
    expect(html).toContain('Portable')
    expect(html).toContain('Industrial')
    expect(html).toContain('Automotive')
  })

  test('escapes special characters in producer names', () => {
    buildDom('')
    storageWrite({
      'evil@example.com': {
        id: 'aaa',
        version: 0,
        bprn: 'BPRN-EA-2026-099001',
        contactEmail: 'evil@example.com',
        companyName: '<script>alert(1)</script>',
        registeredAddress: { line1: '1', town: 'X', postcode: 'X1' },
        batteryTypes: { isPortable: true },
        brandNames: ['<b>Bad</b>'],
        status: 'Approved'
      }
    })

    renderSearchResults(document, { q: 'script', page: 1 }, '/register/{bprn}')
    const html = document.querySelector(
      '[data-testid="register-results-list"]'
    ).innerHTML
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('&lt;script&gt;')
  })

  test('renders an explicit "None" when there are no brands or battery types', () => {
    buildDom('')
    storageWrite({
      'plain@example.com': {
        id: 'plain',
        version: 0,
        bprn: 'BPRN-EA-2026-099002',
        contactEmail: 'plain@example.com',
        companyName: 'Plain Co',
        registeredAddress: { line1: '1', town: 'X', postcode: 'X2' },
        batteryTypes: {
          isPortable: false,
          isIndustrial: false,
          isAutomotive: false
        },
        brandNames: [],
        status: 'Approved'
      }
    })

    renderSearchResults(
      document,
      { q: 'plain co', page: 1 },
      '/register/{bprn}'
    )
    const html = document.querySelector(
      '[data-testid="register-results-list"]'
    ).innerHTML
    expect(html).toContain('None declared')
    expect(html).toContain('>None<')
  })

  test('omits address parts that are missing', () => {
    buildDom('')
    storageWrite({
      'sparse@example.com': {
        id: 'sparse',
        version: 0,
        bprn: 'BPRN-EA-2026-099003',
        contactEmail: 'sparse@example.com',
        companyName: 'Sparse Co',
        registeredAddress: null,
        batteryTypes: { isPortable: true },
        brandNames: ['x'],
        status: 'Approved'
      }
    })

    renderSearchResults(document, { q: 'sparse', page: 1 }, '/register/{bprn}')
    const html = document.querySelector(
      '[data-testid="register-results-list"]'
    ).innerHTML
    expect(html).toContain('Sparse Co')
  })

  test('shows singular phrasing when exactly one producer matches', () => {
    buildDom('')
    renderSearchResults(document, { q: 'kelvin', page: 1 }, '/register/{bprn}')
    const count = document.querySelector(
      '[data-testid="register-result-count"]'
    )
    expect(count.textContent).toContain('1 producer found.')
  })
})

describe('prefillForm', () => {
  test('writes querystring values into matching form fields', () => {
    buildDom('?q=acme&bprn=BPRN-EA&postcode=M1')
    prefillForm(document, { q: 'acme', bprn: 'BPRN-EA', postcode: 'M1' })

    expect(document.querySelector('[name="q"]').value).toBe('acme')
    expect(document.querySelector('[name="bprn"]').value).toBe('BPRN-EA')
    expect(document.querySelector('[name="postcode"]').value).toBe('M1')
  })

  test('writes empty string when query value is undefined', () => {
    buildDom('')
    document.querySelector('[name="q"]').value = 'old'
    prefillForm(document, {})
    expect(document.querySelector('[name="q"]').value).toBe('')
  })
})

describe('renderSearchResults brandNames fallback', () => {
  test('renders "None" when brandNames is null on the producer', () => {
    buildDom('')
    storageWrite({
      'nullbrand@example.com': {
        id: 'nb',
        version: 0,
        bprn: 'BPRN-EA-2026-099004',
        contactEmail: 'nullbrand@example.com',
        companyName: 'NullBrand Co',
        registeredAddress: { line1: '1', town: 'X', postcode: 'X9' },
        batteryTypes: { isPortable: true },
        brandNames: null,
        status: 'Approved'
      }
    })

    renderSearchResults(
      document,
      { q: 'nullbrand', page: 1 },
      '/register/{bprn}'
    )
    const html = document.querySelector(
      '[data-testid="register-results-list"]'
    ).innerHTML
    expect(html).toContain('>None<')
  })
})

describe('initSearch', () => {
  test('reads query from location.search and prefills + renders', () => {
    buildDom('?q=kelvin&page=1')
    const result = initSearch(document, globalThis.location)
    expect(result.totalCount).toBe(1)
    expect(document.querySelector('[name="q"]').value).toBe('kelvin')
  })

  test('treats an unparseable page number as 1', () => {
    buildDom('?page=not-a-number')
    const result = initSearch(document, globalThis.location)
    expect(result.page).toBe(1)
  })

  test('falls back to default detail URL template when payload missing', () => {
    document.body.innerHTML = `<div id="register-results"></div>`
    Object.defineProperty(globalThis, 'location', {
      value: { search: '?q=kelvin' },
      writable: true,
      configurable: true
    })
    initSearch(document, globalThis.location)
    const link = document.querySelector('[data-testid="register-result-link"]')
    expect(link.getAttribute('href')).toMatch(/\/register\/BPRN-/)
  })

  test('treats a location without a search property as an empty query', () => {
    buildDom('')
    Object.defineProperty(globalThis, 'location', {
      value: {},
      writable: true,
      configurable: true
    })
    const result = initSearch(document, globalThis.location)
    expect(result.totalCount).toBeGreaterThan(0)
  })
})

const storageWrite = (producers) => {
  globalThis.localStorage.setItem(
    'npwd-batteries:producers',
    JSON.stringify(producers)
  )
  globalThis.localStorage.setItem(
    'npwd-batteries:seed-version',
    String(seedData.seedVersion)
  )
}
