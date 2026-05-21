// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { initDeclaration } from './index.js'
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

describe('initDeclaration auth gate', () => {
  test('redirects to /sign-in when not authenticated', () => {
    storage.signOut()
    buildDom({
      step: 'smallProducerDeclaration',
      target: 'hydrate',
      registrationId: 'reg-1'
    })
    expect(initDeclaration(document, globalThis.location)).toBe(false)
    expect(assignSpy).toHaveBeenCalledWith('/sign-in')
  })

  test('redirects to scheme-represented when registration is on the scheme route', () => {
    const reg = storage.saveRegistration({
      compliancePeriod: '2026',
      producerRoute: 'complianceScheme'
    })
    buildDom({
      step: 'smallProducerDeclaration',
      target: 'hydrate',
      registrationId: reg.id
    })
    expect(initDeclaration(document, globalThis.location)).toBe(
      'redirected-to-scheme-represented'
    )
    expect(assignSpy).toHaveBeenCalledWith(
      `/annual-return/${reg.id}/scheme-represented`
    )
  })
})

describe('initDeclaration submission-submit branch', () => {
  test('persists savedFields and navigates to confirmation', () => {
    upsertSubmission('reg-1', {
      submissionType: 'smallProducerAnnual',
      lines: []
    })
    storage.saveRegistration({
      id: 'reg-1',
      producerId: 'p',
      compliancePeriod: '2026',
      status: 'Approved'
    })

    buildDom({
      step: 'smallProducerDeclaration',
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
      nextStep: '/annual-return/reg-1/small-producer/confirmation'
    })

    expect(initDeclaration(document, globalThis.location)).toBe('navigated')
    expect(assignSpy).toHaveBeenCalledWith(
      '/annual-return/reg-1/small-producer/confirmation'
    )
    const submission = storage.listSubmissionsForRegistration('reg-1')[0]
    expect(submission.status).toBe('Submitted')
    expect(submission.declaration.firstName).toBe('A')
  })

  test('returns "persisted" when nextStep is missing', () => {
    upsertSubmission('reg-1', {
      submissionType: 'smallProducerAnnual',
      lines: []
    })
    buildDom({
      step: 'smallProducerDeclaration',
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
      }
    })
    expect(initDeclaration(document, globalThis.location)).toBe('persisted')
  })

  test('does not throw when the registration record is missing on submit', () => {
    buildDom({
      step: 'smallProducerDeclaration',
      target: 'submission-submit',
      registrationId: 'reg-orphan',
      savedFields: {
        declaration: { firstName: 'A', lastName: 'B', position: 'C' },
        status: 'Submitted'
      },
      nextStep: '/done'
    })
    expect(() => initDeclaration(document, globalThis.location)).not.toThrow()
  })
})

describe('initDeclaration hydrate branch', () => {
  test('prefills form from an existing declaration', () => {
    upsertSubmission('reg-1', {
      submissionType: 'smallProducerAnnual',
      lines: [],
      declaration: {
        firstName: 'Sam',
        lastName: 'Smith',
        position: 'Director',
        declaredAt: '2026-05-02T00:00:00Z'
      }
    })

    buildDom({
      step: 'smallProducerDeclaration',
      target: 'hydrate',
      registrationId: 'reg-1'
    })
    expect(initDeclaration(document, globalThis.location)).toBe('hydrated')
    expect(document.querySelector('[name="declarationFirstName"]').value).toBe(
      'Sam'
    )
    expect(document.querySelector('[name="declarationConfirm"]').checked).toBe(
      true
    )
  })

  test('skipHydration leaves the form untouched', () => {
    upsertSubmission('reg-1', {
      submissionType: 'smallProducerAnnual',
      lines: [],
      declaration: { firstName: 'Sam', lastName: 'X', position: 'Y' }
    })
    buildDom({
      step: 'smallProducerDeclaration',
      target: 'hydrate',
      registrationId: 'reg-1',
      skipHydration: true
    })
    document.querySelector('[name="declarationFirstName"]').value = 'just-typed'

    initDeclaration(document, globalThis.location)
    expect(document.querySelector('[name="declarationFirstName"]').value).toBe(
      'just-typed'
    )
  })

  test('runs without a form silently', () => {
    document.body.innerHTML = `<script id="page-payload" type="application/json">${JSON.stringify({ step: 'smallProducerDeclaration', target: 'hydrate', registrationId: 'reg-1' })}</script>`
    expect(initDeclaration(document, globalThis.location)).toBe('hydrated')
  })

  test('handles a fresh page where no submission exists yet', () => {
    buildDom({
      step: 'smallProducerDeclaration',
      target: 'hydrate',
      registrationId: 'reg-1'
    })
    expect(initDeclaration(document, globalThis.location)).toBe('hydrated')
    expect(document.querySelector('[name="declarationFirstName"]').value).toBe(
      ''
    )
  })

  test('declaration without declaredAt leaves the confirm checkbox unchecked', () => {
    upsertSubmission('reg-1', {
      submissionType: 'smallProducerAnnual',
      lines: [],
      declaration: { firstName: 'Sam', lastName: 'Smith', position: 'Director' }
    })
    buildDom({
      step: 'smallProducerDeclaration',
      target: 'hydrate',
      registrationId: 'reg-1'
    })
    initDeclaration(document, globalThis.location)
    expect(document.querySelector('[name="declarationConfirm"]').checked).toBe(
      false
    )
  })

  test('runs without a page-payload silently', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    document.body.innerHTML = `<form><input name="declarationFirstName" /></form>`
    expect(initDeclaration(document, globalThis.location)).toBe('hydrated')
  })
})
