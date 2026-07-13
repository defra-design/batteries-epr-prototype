// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runRegulatorTargets } from './index.js'
import { storage } from '../../storage-adapter.js'

const INPUT_IDS = [
  'collectionPortable',
  'collectionIndustrial',
  'collectionAutomotive',
  'recyclingPortable',
  'recyclingIndustrial',
  'recyclingAutomotive'
]

const buildDom = (payload) => {
  const inputs = INPUT_IDS.map((id) => `<input id="${id}" />`).join('')
  document.body.innerHTML = `
    <p data-testid="regulator-targets-agency" hidden></p>
    ${inputs}
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
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
    expect(document.querySelector('#collectionPortable').value).toBe('45')
    expect(document.querySelector('#collectionIndustrial').value).toBe('100')
    expect(document.querySelector('#recyclingIndustrial').value).toBe('50')
  })

  test('renders a recent-changes preview scoped to the agency', () => {
    storage.setCurrentAgencyCode('EA')
    document.body.innerHTML = `
      <p data-testid="regulator-targets-agency" hidden></p>
      ${INPUT_IDS.map((id) => `<input id="${id}" />`).join('')}
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

  test('hydrates from stored targets when the agency has customised them', () => {
    storage.setCurrentAgencyCode('NRW')
    storage.saveRegulatorTargets('NRW', {
      collection: { portable: 30, industrial: 40, automotive: 50 },
      recycling: { portable: 60, industrial: 70, automotive: 80 }
    })
    buildDom({ view: 'targets', target: 'hydrate' })
    runRegulatorTargets(document)
    expect(document.querySelector('#collectionPortable').value).toBe('30')
    expect(document.querySelector('#recyclingAutomotive').value).toBe('80')
  })

  test('persists clamped values and returns to the dashboard', () => {
    storage.setCurrentAgencyCode('SEPA')
    const assign = vi.fn()
    buildDom({
      view: 'targets',
      target: 'persist',
      values: {
        collection: { portable: '45', industrial: '250', automotive: '-5' },
        recycling: { portable: 'abc', industrial: '50', automotive: '50' }
      }
    })
    expect(runRegulatorTargets(document, { assign })).toBe('saved')
    expect(assign).toHaveBeenCalledWith('/regulator/targets?saved=1')
    expect(storage.getRegulatorTargets('SEPA')).toEqual({
      collection: { portable: 45, industrial: 100, automotive: 0 },
      recycling: { portable: 0, industrial: 50, automotive: 50 }
    })
  })
})
