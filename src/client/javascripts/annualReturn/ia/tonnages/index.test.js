// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { initIaTonnages } from './index.js'
import { storage } from '../../../storage-adapter.js'
import { upsertSubmission } from '../persist-submission.js'

const setupProducer = (batteryTypes) => {
  storage.setCurrentUser({ email: 'a@b.com' })
  storage.saveProducer({
    contactEmail: 'a@b.com',
    companyName: 'Acme',
    registeredAddress: { postcode: 'M1 4AA' },
    batteryTypes
  })
}

const buildDom = (payload) => {
  document.body.innerHTML = `
    <form>
      <div data-ia-category="industrial" data-testid="ia-section-industrial" hidden>
        <input name="t_industrial_placed_leadAcid" data-tonnage-input="ia" data-category="industrial" data-activity="placed" data-chemistry="leadAcid" />
        <input name="t_industrial_collected_leadAcid" data-tonnage-input="ia" data-category="industrial" data-activity="collected" data-chemistry="leadAcid" />
      </div>
      <div data-ia-category="automotive" data-testid="ia-section-automotive" hidden>
        <input name="t_automotive_exported_leadAcid" data-tonnage-input="ia" data-category="automotive" data-activity="exported" data-chemistry="leadAcid" />
      </div>
      <span data-testid="ia-total-placed">0.000 tonnes</span>
      <span data-testid="ia-total-collected">0.000 tonnes</span>
      <span data-testid="ia-total-delivered">0.000 tonnes</span>
      <span data-testid="ia-total-exported">0.000 tonnes</span>
    </form>
    <script id="page-payload" type="application/json">${JSON.stringify(payload ?? {})}</script>
  `
}

let assignSpy

beforeEach(() => {
  globalThis.localStorage.clear()
  assignSpy = vi.fn()
  Object.defineProperty(globalThis, 'location', {
    value: { assign: assignSpy },
    writable: true,
    configurable: true
  })
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('initIaTonnages — auth gate', () => {
  test('redirects when not signed in', () => {
    buildDom({ step: 'iaTonnages', target: 'hydrate', registrationId: 'reg-1' })
    expect(initIaTonnages(document, globalThis.location)).toBe(false)
    expect(assignSpy).toHaveBeenCalledWith('/sign-in')
  })
})

describe('initIaTonnages — submission branch', () => {
  test('persists savedFields and navigates to nextStep', () => {
    setupProducer({ isIndustrial: true })
    buildDom({
      step: 'iaTonnages',
      target: 'submission',
      registrationId: 'reg-1',
      savedFields: {
        submissionType: 'industrialAutomotiveAnnual',
        lines: []
      },
      nextStep: '/annual-return/reg-1/ia/declaration'
    })

    expect(initIaTonnages(document, globalThis.location)).toBe('navigated')
    expect(assignSpy).toHaveBeenCalledWith(
      '/annual-return/reg-1/ia/declaration'
    )
    expect(storage.listSubmissionsForRegistration('reg-1')).toHaveLength(1)
  })

  test('returns "persisted" when nextStep is missing', () => {
    setupProducer({ isIndustrial: true })
    buildDom({
      step: 'iaTonnages',
      target: 'submission',
      registrationId: 'reg-1',
      savedFields: {
        submissionType: 'industrialAutomotiveAnnual',
        lines: []
      }
    })
    expect(initIaTonnages(document, globalThis.location)).toBe('persisted')
  })

  test('skips upsert when savedFields missing', () => {
    setupProducer({ isIndustrial: true })
    buildDom({
      step: 'iaTonnages',
      target: 'submission',
      registrationId: 'reg-1'
    })
    expect(initIaTonnages(document, globalThis.location)).toBe('persisted')
    expect(storage.listSubmissionsForRegistration('reg-1')).toHaveLength(0)
  })
})

describe('initIaTonnages — hydrate branch', () => {
  test('shows only industrial section for industrial-only producer', () => {
    setupProducer({ isIndustrial: true, isAutomotive: false })
    buildDom({
      step: 'iaTonnages',
      target: 'hydrate',
      registrationId: 'reg-1'
    })
    initIaTonnages(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="ia-section-industrial"]').hidden
    ).toBe(false)
    expect(
      document.querySelector('[data-testid="ia-section-automotive"]').hidden
    ).toBe(true)
  })

  test('shows both sections for industrial+automotive producer', () => {
    setupProducer({ isIndustrial: true, isAutomotive: true })
    buildDom({
      step: 'iaTonnages',
      target: 'hydrate',
      registrationId: 'reg-1'
    })
    initIaTonnages(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="ia-section-industrial"]').hidden
    ).toBe(false)
    expect(
      document.querySelector('[data-testid="ia-section-automotive"]').hidden
    ).toBe(false)
  })

  test('hydrates form fields from existing submission and updates totals on input', () => {
    setupProducer({ isIndustrial: true, isAutomotive: true })
    upsertSubmission('reg-1', {
      submissionType: 'industrialAutomotiveAnnual',
      lines: [
        {
          category: 'industrial',
          activity: 'placed',
          chemistry: 'leadAcid',
          subCategory: null,
          tonnes: '1.500'
        },
        {
          category: 'automotive',
          activity: 'exported',
          chemistry: 'leadAcid',
          subCategory: null,
          tonnes: '0.500'
        }
      ]
    })
    buildDom({
      step: 'iaTonnages',
      target: 'hydrate',
      registrationId: 'reg-1'
    })

    initIaTonnages(document, globalThis.location)
    expect(
      document.querySelector('[name="t_industrial_placed_leadAcid"]').value
    ).toBe('1.500')
    expect(
      document.querySelector('[data-testid="ia-total-placed"]').textContent
    ).toBe('1.500 tonnes')
    expect(
      document.querySelector('[data-testid="ia-total-exported"]').textContent
    ).toBe('0.500 tonnes')
  })

  test('updates totals live on input', () => {
    setupProducer({ isIndustrial: true })
    buildDom({
      step: 'iaTonnages',
      target: 'hydrate',
      registrationId: 'reg-1'
    })
    initIaTonnages(document, globalThis.location)

    const input = document.querySelector(
      '[name="t_industrial_placed_leadAcid"]'
    )
    input.value = '0.5'
    input.dispatchEvent(new Event('input'))
    expect(
      document.querySelector('[data-testid="ia-total-placed"]').textContent
    ).toBe('0.500 tonnes')
  })

  test('does not count hidden category sections in the running total', () => {
    setupProducer({ isIndustrial: true, isAutomotive: false })
    buildDom({
      step: 'iaTonnages',
      target: 'hydrate',
      registrationId: 'reg-1'
    })
    initIaTonnages(document, globalThis.location)

    const hiddenInput = document.querySelector(
      '[name="t_automotive_exported_leadAcid"]'
    )
    hiddenInput.value = '99'
    hiddenInput.dispatchEvent(new Event('input'))
    expect(
      document.querySelector('[data-testid="ia-total-exported"]').textContent
    ).toBe('0.000 tonnes')
  })

  test('skipHydration leaves form values untouched', () => {
    setupProducer({ isIndustrial: true })
    upsertSubmission('reg-1', {
      submissionType: 'industrialAutomotiveAnnual',
      lines: [
        {
          category: 'industrial',
          activity: 'placed',
          chemistry: 'leadAcid',
          subCategory: null,
          tonnes: '1.500'
        }
      ]
    })
    buildDom({
      step: 'iaTonnages',
      target: 'hydrate',
      registrationId: 'reg-1',
      skipHydration: true
    })
    document.querySelector('[name="t_industrial_placed_leadAcid"]').value =
      'just-typed'

    initIaTonnages(document, globalThis.location)
    expect(
      document.querySelector('[name="t_industrial_placed_leadAcid"]').value
    ).toBe('just-typed')
  })

  test('runs without a form silently', () => {
    setupProducer({ isIndustrial: true })
    document.body.innerHTML = `<script id="page-payload" type="application/json">${JSON.stringify({ step: 'iaTonnages', target: 'hydrate', registrationId: 'reg-1' })}</script>`
    expect(initIaTonnages(document, globalThis.location)).toBe('hydrated')
  })

  test('runs without a page-payload silently', () => {
    setupProducer({ isIndustrial: true })
    document.body.innerHTML = `<form><input name="t_industrial_placed_leadAcid" data-tonnage-input="ia" data-category="industrial" data-activity="placed" data-chemistry="leadAcid" /></form>`
    expect(initIaTonnages(document, globalThis.location)).toBe('hydrated')
  })

  test('handles a producer with no batteryTypes object', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    globalThis.localStorage.setItem(
      'npwd-batteries:producers',
      JSON.stringify({
        'a@b.com': { contactEmail: 'a@b.com', companyName: 'Acme' }
      })
    )
    buildDom({
      step: 'iaTonnages',
      target: 'hydrate',
      registrationId: 'reg-1'
    })
    expect(() => initIaTonnages(document, globalThis.location)).not.toThrow()
  })

  test('runs without total-display nodes silently', () => {
    setupProducer({ isIndustrial: true })
    document.body.innerHTML = `
      <form>
        <div data-ia-category="industrial" data-testid="ia-section-industrial" hidden>
          <input name="t_industrial_placed_leadAcid" data-tonnage-input="ia" data-category="industrial" data-activity="placed" data-chemistry="leadAcid" />
        </div>
      </form>
      <script id="page-payload" type="application/json">${JSON.stringify({ step: 'iaTonnages', target: 'hydrate', registrationId: 'reg-1' })}</script>
    `
    expect(() => initIaTonnages(document, globalThis.location)).not.toThrow()
  })
})
