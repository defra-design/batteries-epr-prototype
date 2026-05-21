// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { initTonnages } from './index.js'
import { storage } from '../../../storage-adapter.js'
import { upsertSubmission } from '../persist-submission.js'

const buildDom = (payload) => {
  document.body.innerHTML = `
    <form>
      <input type="radio" name="mode" value="simple" id="mode-1" ${payload?.formMode === 'simple' ? 'checked' : ''} />
      <input type="radio" name="mode" value="detailed" id="mode-2" ${payload?.formMode === 'detailed' ? 'checked' : ''} />
      <div data-testid="simple-fields">
        <input name="t_leadAcid" data-tonnage-input="simple" data-chemistry="leadAcid" value="" />
        <input name="t_nickelCadmium" data-tonnage-input="simple" data-chemistry="nickelCadmium" value="" />
        <input name="t_other" data-tonnage-input="simple" data-chemistry="other" value="" />
      </div>
      <div data-testid="detailed-fields" hidden>
        <input name="t_leadAcid_buttonCells" data-tonnage-input="detailed" data-chemistry="leadAcid" data-sub-category="buttonCells" value="" />
        <input name="t_other_other" data-tonnage-input="detailed" data-chemistry="other" data-sub-category="other" value="" />
      </div>
      <span data-testid="grand-total-value">0.000</span>
    </form>
    <script id="page-payload" type="application/json">${JSON.stringify(payload?.json ?? {})}</script>
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
  storage.setCurrentUser({ email: 'a@b.com' })
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('initTonnages — auth gate', () => {
  test('redirects to /sign-in when not authenticated', () => {
    storage.signOut()
    buildDom({
      json: {
        step: 'smallProducerTonnages',
        target: 'hydrate',
        registrationId: 'reg-1'
      },
      formMode: 'simple'
    })
    expect(initTonnages(document, globalThis.location)).toBe(false)
    expect(assignSpy).toHaveBeenCalledWith('/sign-in')
  })

  test('redirects to scheme-represented when registration is on the scheme route', () => {
    const reg = storage.saveRegistration({
      compliancePeriod: '2026',
      producerRoute: 'complianceScheme'
    })
    buildDom({
      json: {
        step: 'smallProducerTonnages',
        target: 'hydrate',
        registrationId: reg.id
      },
      formMode: 'simple'
    })
    expect(initTonnages(document, globalThis.location)).toBe(
      'redirected-to-scheme-represented'
    )
    expect(assignSpy).toHaveBeenCalledWith(
      `/annual-return/${reg.id}/scheme-represented`
    )
  })
})

describe('initTonnages — submission branch', () => {
  test('persists savedFields and navigates to nextStep', () => {
    const savedFields = {
      submissionType: 'smallProducerAnnual',
      useDetailedDataEntry: false,
      lines: [
        {
          category: 'portable',
          activity: 'placed',
          chemistry: 'leadAcid',
          subCategory: null,
          tonnes: '0.500'
        }
      ],
      totals: { placedTotal: '0.500' }
    }
    buildDom({
      json: {
        step: 'smallProducerTonnages',
        target: 'submission',
        registrationId: 'reg-1',
        savedFields,
        nextStep: '/annual-return/reg-1/small-producer/declaration'
      },
      formMode: 'simple'
    })

    expect(initTonnages(document, globalThis.location)).toBe('navigated')
    expect(assignSpy).toHaveBeenCalledWith(
      '/annual-return/reg-1/small-producer/declaration'
    )
    const submissions = storage.listSubmissionsForRegistration('reg-1')
    expect(submissions).toHaveLength(1)
    expect(submissions[0].lines[0].tonnes).toBe('0.500')
  })

  test('returns "persisted" when nextStep is missing', () => {
    buildDom({
      json: {
        step: 'smallProducerTonnages',
        target: 'submission',
        registrationId: 'reg-1',
        savedFields: { submissionType: 'smallProducerAnnual', lines: [] }
      },
      formMode: 'simple'
    })
    expect(initTonnages(document, globalThis.location)).toBe('persisted')
  })

  test('skips upsert when savedFields is missing', () => {
    buildDom({
      json: {
        step: 'smallProducerTonnages',
        target: 'submission',
        registrationId: 'reg-1'
      },
      formMode: 'simple'
    })
    expect(initTonnages(document, globalThis.location)).toBe('persisted')
    expect(storage.listSubmissionsForRegistration('reg-1')).toHaveLength(0)
  })
})

describe('initTonnages — hydrate branch', () => {
  test('hydrates form from existing submission and renders the running total', () => {
    upsertSubmission('reg-1', {
      submissionType: 'smallProducerAnnual',
      useDetailedDataEntry: false,
      lines: [
        { chemistry: 'leadAcid', subCategory: null, tonnes: '0.123' },
        { chemistry: 'nickelCadmium', subCategory: null, tonnes: '0.400' }
      ]
    })

    buildDom({
      json: {
        step: 'smallProducerTonnages',
        target: 'hydrate',
        registrationId: 'reg-1'
      },
      formMode: 'simple'
    })

    expect(initTonnages(document, globalThis.location)).toBe('hydrated')
    expect(document.querySelector('[name="t_leadAcid"]').value).toBe('0.123')
    expect(document.querySelector('[name="t_nickelCadmium"]').value).toBe(
      '0.400'
    )
    expect(
      document.querySelector('[data-testid="grand-total-value"]').textContent
    ).toBe('0.523')
  })

  test('skips hydration when skipHydration is true (preserves server-rendered values)', () => {
    upsertSubmission('reg-1', {
      submissionType: 'smallProducerAnnual',
      useDetailedDataEntry: false,
      lines: [{ chemistry: 'leadAcid', subCategory: null, tonnes: '0.123' }]
    })

    buildDom({
      json: {
        step: 'smallProducerTonnages',
        target: 'hydrate',
        registrationId: 'reg-1',
        skipHydration: true
      },
      formMode: 'simple'
    })
    document.querySelector('[name="t_leadAcid"]').value = 'just-typed'

    initTonnages(document, globalThis.location)
    expect(document.querySelector('[name="t_leadAcid"]').value).toBe(
      'just-typed'
    )
  })

  test('toggles between simple and detailed sections on mode change', () => {
    buildDom({
      json: {
        step: 'smallProducerTonnages',
        target: 'hydrate',
        registrationId: 'reg-1'
      },
      formMode: 'simple'
    })
    initTonnages(document, globalThis.location)
    expect(document.querySelector('[data-testid="simple-fields"]').hidden).toBe(
      false
    )
    expect(
      document.querySelector('[data-testid="detailed-fields"]').hidden
    ).toBe(true)

    document.getElementById('mode-2').checked = true
    document.getElementById('mode-2').dispatchEvent(new Event('change'))
    expect(document.querySelector('[data-testid="simple-fields"]').hidden).toBe(
      true
    )
    expect(
      document.querySelector('[data-testid="detailed-fields"]').hidden
    ).toBe(false)
  })

  test('updates the grand total live as the user types', () => {
    buildDom({
      json: {
        step: 'smallProducerTonnages',
        target: 'hydrate',
        registrationId: 'reg-1'
      },
      formMode: 'simple'
    })
    initTonnages(document, globalThis.location)
    const input = document.querySelector('[name="t_leadAcid"]')
    input.value = '0.5'
    input.dispatchEvent(new Event('input'))
    expect(
      document.querySelector('[data-testid="grand-total-value"]').textContent
    ).toBe('0.500')
  })

  test('treats negative or non-numeric input as zero in the running total', () => {
    buildDom({
      json: {
        step: 'smallProducerTonnages',
        target: 'hydrate',
        registrationId: 'reg-1'
      },
      formMode: 'simple'
    })
    initTonnages(document, globalThis.location)
    document.querySelector('[name="t_leadAcid"]').value = 'abc'
    document
      .querySelector('[name="t_leadAcid"]')
      .dispatchEvent(new Event('input'))
    expect(
      document.querySelector('[data-testid="grand-total-value"]').textContent
    ).toBe('0.000')
  })

  test('runs without a form silently', () => {
    document.body.innerHTML = `<script id="page-payload" type="application/json">${JSON.stringify({ step: 'smallProducerTonnages', target: 'hydrate', registrationId: 'reg-1' })}</script>`
    expect(initTonnages(document, globalThis.location)).toBe('hydrated')
  })

  test('runs without a page-payload silently', () => {
    document.body.innerHTML = `<form><input name="t_leadAcid" data-tonnage-input="simple" data-chemistry="leadAcid" /></form>`
    expect(initTonnages(document, globalThis.location)).toBe('hydrated')
  })
})
