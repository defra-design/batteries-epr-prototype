// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runApplicationStep } from './index.js'
import { storage, createOperator } from '../../storage-adapter.js'

const buildDom = (payload, formHtml = '') => {
  document.body.innerHTML = `
    ${formHtml}
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

let assignSpy

const seedOperator = (overrides = {}) => {
  const op = createOperator({
    id: '33333333-0001-4000-a000-000000000001',
    name: 'Green & Recycling Ltd',
    approvalType: 'abto',
    companyRegistrationNo: '12345678',
    approvalStatus: 'not-started',
    batteryTypes: { isPortable: true, isIndustrial: true, isAutomotive: false },
    registeredAddress: {
      line1: 'Unit 3',
      line2: null,
      town: 'Sheffield',
      postcode: 'S9 2RG'
    },
    sites: [
      {
        name: 'Sheffield Facility',
        address: {
          line1: 'Unit 3',
          town: 'Sheffield',
          postcode: 'S9 2RG'
        },
        batteryTypes: { isPortable: true, isIndustrial: true, isAutomotive: false },
        operationsDescription: 'Battery treatment.'
      }
    ],
    ...overrides
  })
  storage.saveOperator(op)
  storage.setCurrentOperatorId(op.id)
  return op
}

beforeEach(() => {
  globalThis.localStorage.clear()
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
  test('applies the patch to the operator and navigates to next', () => {
    seedOperator()
    buildDom({
      step: 'operator-details',
      target: 'persist',
      patch: { name: 'Updated', approvalType: 'abe', companyRegistrationNo: '99999999' },
      next: '/operator/application/registered-address'
    })

    expect(runApplicationStep(document, globalThis.location)).toBe('navigated')
    const op = storage.currentOperator()
    expect(op.name).toBe('Updated')
    expect(op.approvalType).toBe('abe')
    expect(assignSpy).toHaveBeenCalledWith(
      '/operator/application/registered-address'
    )
  })

  test('persists without navigating when next is null', () => {
    seedOperator()
    buildDom({
      step: 'declaration',
      target: 'persist',
      patch: { approvalStatus: 'submitted', submittedOn: '2026-05-01' },
      next: null
    })

    expect(runApplicationStep(document, globalThis.location)).toBe('persisted')
    expect(storage.currentOperator().approvalStatus).toBe('submitted')
    expect(assignSpy).not.toHaveBeenCalled()
  })
})

describe('runApplicationStep hydrate target', () => {
  test('hydrates the operator-details form from the operator record', () => {
    seedOperator()
    buildDom(
      { step: 'operator-details', target: 'hydrate' },
      '<form><input name="name" /><input type="radio" name="approvalType" value="abto" /><input type="radio" name="approvalType" value="abe" /><input name="companyRegistrationNo" /></form>'
    )

    expect(runApplicationStep(document, globalThis.location)).toBe('hydrated')
    expect(document.querySelector('input[name="name"]').value).toBe(
      'Green & Recycling Ltd'
    )
    expect(
      document.querySelector('input[name="approvalType"][value="abto"]').checked
    ).toBe(true)
    expect(document.querySelector('input[name="companyRegistrationNo"]').value).toBe(
      '12345678'
    )
  })

  test('hydrates registered-address from the operator record', () => {
    seedOperator()
    buildDom(
      { step: 'registered-address', target: 'hydrate' },
      '<form><input name="line1" /><input name="line2" /><input name="town" /><input name="postcode" /></form>'
    )

    runApplicationStep(document, globalThis.location)
    expect(document.querySelector('input[name="line1"]').value).toBe('Unit 3')
    expect(document.querySelector('input[name="town"]').value).toBe('Sheffield')
    expect(document.querySelector('input[name="line2"]').value).toBe('')
  })

  test('hydrates site-details from the operator record', () => {
    seedOperator()
    buildDom(
      { step: 'site-details', target: 'hydrate' },
      '<form><input name="siteName" /><input name="siteLine1" /><input name="siteTown" /><input name="sitePostcode" /><input type="checkbox" name="isPortable" value="yes" /><input type="checkbox" name="isIndustrial" value="yes" /><input type="checkbox" name="isAutomotive" value="yes" /><textarea name="operationsDescription"></textarea></form>'
    )

    runApplicationStep(document, globalThis.location)
    expect(document.querySelector('input[name="siteName"]').value).toBe(
      'Sheffield Facility'
    )
    expect(
      document.querySelector('input[name="isPortable"]').checked
    ).toBe(true)
    expect(
      document.querySelector('input[name="isIndustrial"]').checked
    ).toBe(true)
    expect(
      document.querySelector('input[name="isAutomotive"]').checked
    ).toBe(false)
    expect(
      document.querySelector('textarea[name="operationsDescription"]').value
    ).toBe('Battery treatment.')
  })

  test('hydrates declaration with checked checkbox when submitted', () => {
    seedOperator({ approvalStatus: 'submitted' })
    buildDom(
      { step: 'declaration', target: 'hydrate' },
      '<form><input type="checkbox" name="declarationAccepted" value="yes" /></form>'
    )
    runApplicationStep(document, globalThis.location)
    expect(
      document.querySelector('input[name="declarationAccepted"]').checked
    ).toBe(true)
  })

  test('hydrates declaration with checked checkbox when approved', () => {
    seedOperator({ approvalStatus: 'approved' })
    buildDom(
      { step: 'declaration', target: 'hydrate' },
      '<form><input type="checkbox" name="declarationAccepted" value="yes" /></form>'
    )
    runApplicationStep(document, globalThis.location)
    expect(
      document.querySelector('input[name="declarationAccepted"]').checked
    ).toBe(true)
  })

  test('declaration checkbox unchecked when not-started', () => {
    seedOperator()
    buildDom(
      { step: 'declaration', target: 'hydrate' },
      '<form><input type="checkbox" name="declarationAccepted" value="yes" /></form>'
    )
    runApplicationStep(document, globalThis.location)
    expect(
      document.querySelector('input[name="declarationAccepted"]').checked
    ).toBe(false)
  })

  test('hydrates empty defaults when operator has no values', () => {
    seedOperator({
      name: null,
      approvalType: null,
      companyRegistrationNo: null,
      registeredAddress: null,
      sites: []
    })

    for (const step of [
      'operator-details',
      'registered-address',
      'site-details',
      'declaration'
    ]) {
      buildDom({ step, target: 'hydrate' }, '<form></form>')
      expect(runApplicationStep(document, globalThis.location)).toBe('hydrated')
    }
  })

  test('confirmation step skips hydration', () => {
    seedOperator()
    buildDom({ step: 'confirmation', target: 'hydrate' }, '')
    expect(runApplicationStep(document, globalThis.location)).toBe('hydrated')
  })

  test('hydration skipped when form is missing', () => {
    seedOperator()
    buildDom({ step: 'operator-details', target: 'hydrate' })
    expect(runApplicationStep(document, globalThis.location)).toBe('hydrated')
  })

  test('redirects to sign-in when no current operator', () => {
    buildDom({ step: 'operator-details', target: 'hydrate' }, '<form></form>')
    expect(runApplicationStep(document, globalThis.location)).toBe(
      'redirected-to-sign-in'
    )
    expect(assignSpy).toHaveBeenCalledWith('/operator/sign-in')
  })
})
