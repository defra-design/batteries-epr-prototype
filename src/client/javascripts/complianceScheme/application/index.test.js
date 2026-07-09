// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runApplicationStep } from './index.js'
import { storage } from '../../storage-adapter.js'

const buildDom = (payload, formHtml = '') => {
  document.body.innerHTML = `
    ${formHtml}
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

let assignSpy

beforeEach(() => {
  globalThis.localStorage.clear()
  storage.seedDemoData()
  storage.setCurrentSchemeId(storage.listSchemes()[0].id)
  assignSpy = vi.fn()
  Object.defineProperty(globalThis, 'location', {
    value: { assign: assignSpy, reload: vi.fn() },
    writable: true,
    configurable: true
  })
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('runApplicationStep persist target', () => {
  test('applies the patch to the seeded scheme and navigates to next', () => {
    buildDom({
      step: 'scheme-details',
      target: 'persist',
      patch: { name: 'Updated', tradingNames: ['T1', 'T2'] },
      next: '/compliance-scheme/application/registered-address'
    })

    expect(runApplicationStep(document, globalThis.location)).toBe('navigated')
    const [scheme] = storage.listSchemes()
    expect(scheme.name).toBe('Updated')
    expect(scheme.tradingNames).toEqual(['T1', 'T2'])
    expect(assignSpy).toHaveBeenCalledWith(
      '/compliance-scheme/application/registered-address'
    )
  })

  test('persists without navigating when next is null', () => {
    buildDom({
      step: 'declaration',
      target: 'persist',
      patch: { approvalStatus: 'submitted', submittedOn: '2026-05-01' },
      next: null
    })

    expect(runApplicationStep(document, globalThis.location)).toBe('persisted')
    const [scheme] = storage.listSchemes()
    expect(scheme.approvalStatus).toBe('submitted')
    expect(scheme.submittedOn).toBe('2026-05-01')
    expect(assignSpy).not.toHaveBeenCalled()
  })
})

describe('runApplicationStep hydrate target', () => {
  test('hydrates the scheme-details form from the scheme record', () => {
    const [scheme] = storage.listSchemes()
    storage.saveScheme({
      ...scheme,
      name: 'Pre-filled scheme',
      tradingNames: ['Alpha', 'Beta']
    })
    buildDom(
      { step: 'scheme-details', target: 'hydrate' },
      '<form><input name="name" /><textarea name="tradingNames"></textarea></form>'
    )

    expect(runApplicationStep(document, globalThis.location)).toBe('hydrated')
    expect(document.querySelector('input[name="name"]').value).toBe(
      'Pre-filled scheme'
    )
    expect(document.querySelector('textarea[name="tradingNames"]').value).toBe(
      'Alpha\nBeta'
    )
  })

  test('hydrates an address form from the scheme record', () => {
    const [scheme] = storage.listSchemes()
    storage.saveScheme({
      ...scheme,
      registeredAddress: {
        line1: '1 Test St',
        line2: null,
        town: 'Townsville',
        postcode: 'LS1 1AA'
      }
    })
    buildDom(
      { step: 'registered-address', target: 'hydrate' },
      '<form><input name="line1" /><input name="line2" /><input name="town" /><input name="postcode" /></form>'
    )

    runApplicationStep(document, globalThis.location)
    expect(document.querySelector('input[name="line1"]').value).toBe(
      '1 Test St'
    )
    expect(document.querySelector('input[name="town"]').value).toBe(
      'Townsville'
    )
    expect(document.querySelector('input[name="postcode"]').value).toBe(
      'LS1 1AA'
    )
    expect(document.querySelector('input[name="line2"]').value).toBe('')
  })

  test('hydrates contact-address from the scheme record', () => {
    const [scheme] = storage.listSchemes()
    storage.saveScheme({
      ...scheme,
      contactAddress: {
        line1: '2 St',
        line2: 'Suite 1',
        town: 'Town',
        postcode: 'LS2 2BB'
      }
    })
    buildDom(
      { step: 'contact-address', target: 'hydrate' },
      '<form><input name="line1" /><input name="line2" /><input name="town" /><input name="postcode" /></form>'
    )
    runApplicationStep(document, globalThis.location)
    expect(document.querySelector('input[name="line2"]').value).toBe('Suite 1')
  })

  test('hydrates operational-plan, partners, additional-files, declaration, offences', () => {
    const [scheme] = storage.listSchemes()
    storage.saveScheme({
      ...scheme,
      operationalPlan: 'A plan',
      partners: [{ name: 'Alpha' }, { name: 'Beta' }],
      additionalFiles: [{ name: 'a.pdf' }],
      offences: 'A past offence',
      approvalStatus: 'submitted'
    })

    buildDom(
      { step: 'operational-plan', target: 'hydrate' },
      '<form><textarea name="operationalPlan"></textarea></form>'
    )
    runApplicationStep(document, globalThis.location)
    expect(
      document.querySelector('textarea[name="operationalPlan"]').value
    ).toBe('A plan')

    buildDom(
      { step: 'partners', target: 'hydrate' },
      '<form><textarea name="partners"></textarea></form>'
    )
    runApplicationStep(document, globalThis.location)
    expect(document.querySelector('textarea[name="partners"]').value).toBe(
      'Alpha\nBeta'
    )

    buildDom(
      { step: 'additional-files', target: 'hydrate' },
      '<form><textarea name="additionalFiles"></textarea></form>'
    )
    runApplicationStep(document, globalThis.location)
    expect(
      document.querySelector('textarea[name="additionalFiles"]').value
    ).toBe('a.pdf')

    buildDom(
      { step: 'offences', target: 'hydrate' },
      '<form><input type="radio" name="hasOffences" value="yes" /><input type="radio" name="hasOffences" value="no" /><textarea name="offencesDetail"></textarea></form>'
    )
    runApplicationStep(document, globalThis.location)
    expect(
      document.querySelector('input[name="hasOffences"][value="yes"]').checked
    ).toBe(true)
    expect(
      document.querySelector('textarea[name="offencesDetail"]').value
    ).toBe('A past offence')

    buildDom(
      { step: 'declaration', target: 'hydrate' },
      '<form><input type="checkbox" name="declarationAccepted" value="yes" /></form>'
    )
    runApplicationStep(document, globalThis.location)
    expect(
      document.querySelector('input[name="declarationAccepted"]').checked
    ).toBe(true)
  })

  test('confirmation step skips hydration', () => {
    buildDom({ step: 'confirmation', target: 'hydrate' }, '')
    expect(runApplicationStep(document, globalThis.location)).toBe('hydrated')
  })

  test('hydration skipped when form is missing', () => {
    buildDom({ step: 'scheme-details', target: 'hydrate' })
    expect(runApplicationStep(document, globalThis.location)).toBe('hydrated')
  })

  test('offences hydrator leaves the radio empty when scheme has no offences yet', () => {
    buildDom(
      { step: 'offences', target: 'hydrate' },
      '<form><input type="radio" name="hasOffences" value="yes" /><input type="radio" name="hasOffences" value="no" /><textarea name="offencesDetail"></textarea></form>'
    )
    runApplicationStep(document, globalThis.location)
    expect(
      document.querySelector('input[name="hasOffences"][value="yes"]').checked
    ).toBe(false)
    expect(
      document.querySelector('input[name="hasOffences"][value="no"]').checked
    ).toBe(false)
  })

  test('declaration hydrator marks the checkbox when scheme already approved', () => {
    const [scheme] = storage.listSchemes()
    storage.saveScheme({ ...scheme, approvalStatus: 'approved' })
    buildDom(
      { step: 'declaration', target: 'hydrate' },
      '<form><input type="checkbox" name="declarationAccepted" value="yes" /></form>'
    )
    runApplicationStep(document, globalThis.location)
    expect(
      document.querySelector('input[name="declarationAccepted"]').checked
    ).toBe(true)
  })

  test('hydrators return empty defaults when scheme has no values yet', () => {
    const seeded = storage.listSchemes()[0]
    storage.saveScheme({
      ...seeded,
      name: null,
      tradingNames: null,
      registeredAddress: null,
      contactAddress: null,
      operationalPlan: null,
      partners: null,
      additionalFiles: null,
      offences: null,
      approvalStatus: 'not-started'
    })

    for (const step of [
      'scheme-details',
      'registered-address',
      'contact-address',
      'operational-plan',
      'partners',
      'additional-files',
      'declaration'
    ]) {
      buildDom({ step, target: 'hydrate' }, '<form></form>')
      expect(runApplicationStep(document, globalThis.location)).toBe('hydrated')
    }
  })

  test('redirects to the sign-in picker when no current scheme is selected', () => {
    storage.clearCurrentSchemeId()
    buildDom({ step: 'scheme-details', target: 'hydrate' }, '<form></form>')
    expect(runApplicationStep(document, globalThis.location)).toBe(
      'redirected-to-sign-in'
    )
    expect(assignSpy).toHaveBeenCalledWith('/compliance-scheme/sign-in')
  })
})
