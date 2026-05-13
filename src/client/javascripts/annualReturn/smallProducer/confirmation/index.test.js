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
    expect(initConfirmation(document)).toBe(true)
  })

  test('redirects to /sign-in when no user', () => {
    expect(initConfirmation(document)).toBe(false)
    expect(assignSpy).toHaveBeenCalledWith('/sign-in')
  })
})
