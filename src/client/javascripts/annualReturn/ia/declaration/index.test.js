// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { initIaDeclaration } from './index.js'
import { storage } from '../../../storage-adapter.js'
import { upsertSubmission } from '../persist-submission.js'

const buildDom = (payload) => {
  document.body.innerHTML = `
    <form>
      <input name="declarationFirstName" />
      <input name="declarationLastName" />
      <input name="declarationPosition" />
      <input type="checkbox" name="declarationConfirm" value="yes" />
    </form>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
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

describe('initIaDeclaration', () => {
  test('redirects to /sign-in when not authenticated', () => {
    storage.signOut()
    buildDom({
      step: 'iaDeclaration',
      target: 'hydrate',
      registrationId: 'reg-1'
    })
    expect(initIaDeclaration(document, globalThis.location)).toBe(false)
    expect(assignSpy).toHaveBeenCalledWith('/sign-in')
  })

  test('persists savedFields and navigates to confirmation on submit', () => {
    upsertSubmission('reg-1', {
      submissionType: 'industrialAutomotiveAnnual',
      lines: []
    })
    storage.saveRegistration({
      id: 'reg-1',
      producerId: 'p',
      compliancePeriod: '2026',
      status: 'Approved'
    })
    buildDom({
      step: 'iaDeclaration',
      target: 'submission-submit',
      registrationId: 'reg-1',
      savedFields: {
        declaration: {
          firstName: 'A',
          lastName: 'B',
          position: 'C',
          declaredAt: '2026-05-02T00:00:00Z'
        },
        status: 'Submitted'
      },
      nextStep: '/annual-return/reg-1/ia/confirmation'
    })

    expect(initIaDeclaration(document, globalThis.location)).toBe('navigated')
    expect(assignSpy).toHaveBeenCalledWith(
      '/annual-return/reg-1/ia/confirmation'
    )
    const submission = storage.listSubmissionsForRegistration('reg-1')[0]
    expect(submission.status).toBe('Submitted')
  })

  test('returns "persisted" when nextStep is missing', () => {
    upsertSubmission('reg-1', {
      submissionType: 'industrialAutomotiveAnnual',
      lines: []
    })
    buildDom({
      step: 'iaDeclaration',
      target: 'submission-submit',
      registrationId: 'reg-1',
      savedFields: {
        declaration: { firstName: 'A', lastName: 'B', position: 'C' },
        status: 'Submitted'
      }
    })
    expect(initIaDeclaration(document, globalThis.location)).toBe('persisted')
  })

  test('does not throw when registration record is missing on submit', () => {
    buildDom({
      step: 'iaDeclaration',
      target: 'submission-submit',
      registrationId: 'reg-orphan',
      savedFields: {
        declaration: { firstName: 'A', lastName: 'B', position: 'C' },
        status: 'Submitted'
      },
      nextStep: '/done'
    })
    expect(() => initIaDeclaration(document, globalThis.location)).not.toThrow()
  })

  test('hydrates form from existing declaration', () => {
    upsertSubmission('reg-1', {
      submissionType: 'industrialAutomotiveAnnual',
      lines: [],
      declaration: {
        firstName: 'Sam',
        lastName: 'Smith',
        position: 'Director',
        declaredAt: '2026-05-02T00:00:00Z'
      }
    })
    buildDom({
      step: 'iaDeclaration',
      target: 'hydrate',
      registrationId: 'reg-1'
    })
    expect(initIaDeclaration(document, globalThis.location)).toBe('hydrated')
    expect(document.querySelector('[name="declarationFirstName"]').value).toBe(
      'Sam'
    )
    expect(document.querySelector('[name="declarationConfirm"]').checked).toBe(
      true
    )
  })

  test('skipHydration leaves form values untouched', () => {
    upsertSubmission('reg-1', {
      submissionType: 'industrialAutomotiveAnnual',
      lines: [],
      declaration: { firstName: 'Sam', lastName: 'X', position: 'Y' }
    })
    buildDom({
      step: 'iaDeclaration',
      target: 'hydrate',
      registrationId: 'reg-1',
      skipHydration: true
    })
    document.querySelector('[name="declarationFirstName"]').value = 'just-typed'

    initIaDeclaration(document, globalThis.location)
    expect(document.querySelector('[name="declarationFirstName"]').value).toBe(
      'just-typed'
    )
  })

  test('runs without a form silently', () => {
    document.body.innerHTML = `<script id="page-payload" type="application/json">${JSON.stringify({ step: 'iaDeclaration', target: 'hydrate', registrationId: 'reg-1' })}</script>`
    expect(initIaDeclaration(document, globalThis.location)).toBe('hydrated')
  })

  test('runs with no page-payload silently', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    document.body.innerHTML = `<form><input name="declarationFirstName" /></form>`
    expect(initIaDeclaration(document, globalThis.location)).toBe('hydrated')
  })

  test('handles fresh page where no submission exists yet', () => {
    buildDom({
      step: 'iaDeclaration',
      target: 'hydrate',
      registrationId: 'reg-1'
    })
    expect(initIaDeclaration(document, globalThis.location)).toBe('hydrated')
    expect(document.querySelector('[name="declarationFirstName"]').value).toBe(
      ''
    )
  })

  test('declaration without declaredAt leaves the confirm checkbox unchecked', () => {
    upsertSubmission('reg-1', {
      submissionType: 'industrialAutomotiveAnnual',
      lines: [],
      declaration: { firstName: 'Sam', lastName: 'Smith', position: 'Director' }
    })
    buildDom({
      step: 'iaDeclaration',
      target: 'hydrate',
      registrationId: 'reg-1'
    })
    initIaDeclaration(document, globalThis.location)
    expect(document.querySelector('[name="declarationConfirm"]').checked).toBe(
      false
    )
  })
})
