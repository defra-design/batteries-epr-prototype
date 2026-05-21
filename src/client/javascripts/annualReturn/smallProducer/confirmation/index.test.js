// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { initConfirmation } from './index.js'
import { storage } from '../../../storage-adapter.js'

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

describe('initConfirmation', () => {
  test('returns true when authenticated', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    expect(initConfirmation(document, globalThis.location)).toBe(true)
  })

  test('redirects to /sign-in when no user', () => {
    expect(initConfirmation(document, globalThis.location)).toBe(false)
    expect(assignSpy).toHaveBeenCalledWith('/sign-in')
  })

  test('redirects to scheme-represented when registration is on the scheme route', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    const reg = storage.saveRegistration({
      compliancePeriod: '2026',
      producerRoute: 'complianceScheme'
    })
    document.body.innerHTML = `<script id="page-payload" type="application/json">${JSON.stringify({ registrationId: reg.id })}</script>`
    expect(initConfirmation(document, globalThis.location)).toBe(
      'redirected-to-scheme-represented'
    )
    expect(assignSpy).toHaveBeenCalledWith(
      `/annual-return/${reg.id}/scheme-represented`
    )
  })
})
