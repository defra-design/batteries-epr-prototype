// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { requireAuth } from './auth-gate.js'
import { storage } from './storage-adapter.js'

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

describe('requireAuth', () => {
  test('redirects when there is no current user', () => {
    expect(requireAuth()).toBe(false)
    expect(assignSpy).toHaveBeenCalledWith('/sign-in')
  })

  test('redirects to a custom sign-in URL when provided', () => {
    expect(requireAuth('/custom-sign-in')).toBe(false)
    expect(assignSpy).toHaveBeenCalledWith('/custom-sign-in')
  })

  test('redirects when current user has no email', () => {
    storage.setCurrentUser({ email: null })
    expect(requireAuth()).toBe(false)
    expect(assignSpy).toHaveBeenCalledWith('/sign-in')
  })

  test('returns true when a current user is set', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    expect(requireAuth()).toBe(true)
    expect(assignSpy).not.toHaveBeenCalled()
  })
})
