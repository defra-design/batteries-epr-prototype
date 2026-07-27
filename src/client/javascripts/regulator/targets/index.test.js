// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { storage } from '../../storage-adapter.js'
import { runRegulatorTargets } from './index.js'

const FIELDS_HTML = `
  <form data-testid="regulator-targets-form">
    <div data-testid="regulator-targets-collection-fields"></div>
    <div data-testid="regulator-targets-recycling-fields"></div>
  </form>
`

const TARGET_YEARS = ['2026', '2027', '2028', '2029', '2030']

const buildDom = (payload) => {
  const pagePayload = { targetYears: TARGET_YEARS, ...payload }
  document.body.innerHTML = `
    <p data-testid="regulator-targets-agency" hidden></p>
    ${FIELDS_HTML}
    <script id="page-payload" type="application/json">${JSON.stringify(pagePayload)}</script>
  `
}

beforeEach(() => {
  globalThis.localStorage.clear()
  storage.seedDemoData()
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('runRegulatorTargets', () => {
  test('redirects to sign-in when no agency is selected', () => {
    const assign = vi.fn()
    buildDom({ view: 'targets', target: 'hydrate' })
    expect(runRegulatorTargets(document, { assign })).toBe(
      'redirected-to-sign-in'
    )
    expect(assign).toHaveBeenCalledWith('/regulator/sign-in')
  })

  test('hydrates inputs from the seeded defaults and shows the agency name', () => {
    storage.setCurrentAgencyCode('EA')
    buildDom({ view: 'targets', target: 'hydrate' })
    expect(runRegulatorTargets(document)).toBe('hydrated')

    const label = document.querySelector(
      '[data-testid="regulator-targets-agency"]'
    )
    expect(label.hidden).toBe(false)
    expect(label.textContent).toBe('Environment Agency')
    expect(document.querySelector('#collectionPortable2026').value).toBe('45')
    expect(document.querySelector('#collectionIndustrial2026').value).toBe(
      '100'
    )
    expect(document.querySelector('#recyclingIndustrial2027').value).toBe('52')
  })

  test('renders a recent-changes preview scoped to the agency', () => {
    storage.setCurrentAgencyCode('EA')
    document.body.innerHTML = `
      <p data-testid="regulator-targets-agency" hidden></p>
      ${FIELDS_HTML}
      <ol data-testid="regulator-targets-history"></ol>
      <script id="page-payload" type="application/json">${JSON.stringify({
        view: 'targets',
        target: 'hydrate',
        auditCopy: {
          empty: 'No changes yet.',
          fieldLabels: { collection: 'collection', recycling: 'recycling' },
          categoryLabels: {
            portable: 'portable',
            industrial: 'industrial',
            automotive: 'automotive'
          }
        }
      })}</script>
    `
    expect(runRegulatorTargets(document)).toBe('hydrated')
    const items = document.querySelectorAll('[data-testid="audit-entry"]')
    expect(items.length).toBe(3)
  })

  test('builds an input per resolved category, defaulting missing targets to zero', () => {
    storage.setCurrentAgencyCode('EA')
    storage.saveRegulatorCategories('EA', [
      { id: 'portable', label: 'Portable batteries', shortLabel: 'Portable' },
      { id: 'lmt', label: 'LMT batteries', shortLabel: 'LMT' }
    ])
    buildDom({ view: 'targets', target: 'hydrate' })
    runRegulatorTargets(document)
    expect(
      document
        .querySelector('[data-testid="regulator-targets-collection-grid"]')
        .classList.contains('app-target-grid')
    ).toBe(true)
    expect(document.querySelector('#collectionPortable2026').value).toBe('45')
    expect(document.querySelector('#collectionLmt2026').value).toBe('0')
    expect(document.querySelector('input[name="categoryIds"]').value).toBe(
      'portable,lmt'
    )
  })

  test('does not show configured text in each year cell', () => {
    storage.setCurrentAgencyCode('EA')
    buildDom({ view: 'targets', target: 'hydrate' })
    runRegulatorTargets(document)

    expect(document.body.textContent).not.toContain('Configured')
    expect(document.querySelector('.app-target-grid__year p').textContent).toBe(
      '2026'
    )
  })

  test('fills a resolved category with 0 when its stored target is missing', () => {
    storage.setCurrentAgencyCode('EA')
    storage.saveRegulatorTargets('EA', {
      collection: { portable: 45 },
      recycling: { portable: 45 }
    })
    buildDom({ view: 'targets', target: 'hydrate' })
    runRegulatorTargets(document)
    expect(document.querySelector('#collectionPortable2026').value).toBe('45')
    expect(document.querySelector('#collectionIndustrial2026').value).toBe('0')
  })

  test('shows zero when no prior year target can be carried forward', () => {
    storage.setCurrentAgencyCode('EA')
    storage.saveRegulatorTargets('EA', {
      collection: {
        portable: { 2027: 45 },
        industrial: { 2027: 100 },
        automotive: { 2027: 100 }
      },
      recycling: {
        portable: { 2027: 45 },
        industrial: { 2027: 50 },
        automotive: { 2027: 50 }
      }
    })
    buildDom({ view: 'targets', target: 'hydrate' })
    runRegulatorTargets(document)

    expect(document.querySelector('#collectionPortable2026').value).toBe('0')
    expect(document.body.textContent).toContain('Carried forward')
  })

  test('escapes special characters in category labels', () => {
    storage.setCurrentAgencyCode('EA')
    storage.saveRegulatorCategories('EA', [
      { id: 'portable', label: 'Portable', shortLabel: 'A & B' }
    ])
    buildDom({ view: 'targets', target: 'hydrate' })
    runRegulatorTargets(document)
    expect(
      document.querySelector(
        '[data-testid="regulator-targets-collection-fields"]'
      ).innerHTML
    ).toContain('A &amp; B')
  })

  test('hydrates from stored targets when the agency has customised them', () => {
    storage.setCurrentAgencyCode('NRW')
    storage.saveRegulatorTargets('NRW', {
      collection: {
        portable: { 2026: 30 },
        industrial: { 2026: 40 },
        automotive: { 2026: 50 }
      },
      recycling: {
        portable: { 2026: 60 },
        industrial: { 2026: 70 },
        automotive: { 2026: 80 }
      }
    })
    buildDom({ view: 'targets', target: 'hydrate' })
    runRegulatorTargets(document)
    expect(document.querySelector('#collectionPortable2026').value).toBe('30')
    expect(document.querySelector('#recyclingAutomotive2026').value).toBe('80')
  })

  test('persists clamped values and returns to the dashboard', () => {
    storage.setCurrentAgencyCode('SEPA')
    const assign = vi.fn()
    buildDom({
      view: 'targets',
      target: 'persist',
      values: {
        collection: {
          portable: { 2026: '45' },
          industrial: { 2026: '250' },
          automotive: { 2026: '-5' }
        },
        recycling: {
          portable: { 2026: 'abc' },
          industrial: { 2026: '50' },
          automotive: { 2026: '50' }
        }
      }
    })
    expect(runRegulatorTargets(document, { assign })).toBe('saved')
    expect(assign).toHaveBeenCalledWith('/regulator/targets?saved=1')
    expect(storage.getRegulatorTargets('SEPA')).toEqual({
      collection: {
        portable: { 2026: 45 },
        industrial: { 2026: 100 },
        automotive: { 2026: 0 }
      },
      recycling: {
        portable: { 2026: 0 },
        industrial: { 2026: 50 },
        automotive: { 2026: 50 }
      }
    })
  })

  test('still persists a legacy flat payload shape', () => {
    storage.setCurrentAgencyCode('SEPA')
    const assign = vi.fn()
    buildDom({
      view: 'targets',
      target: 'persist',
      values: {
        collection: { portable: '45' },
        recycling: { portable: '50' }
      }
    })

    expect(runRegulatorTargets(document, { assign })).toBe('saved')
    expect(storage.getRegulatorTargets('SEPA')).toEqual({
      collection: { portable: 45 },
      recycling: { portable: 50 }
    })
  })
})
