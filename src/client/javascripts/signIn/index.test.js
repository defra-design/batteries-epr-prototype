// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { completeSignIn, DASHBOARD_URL } from './index.js'
import { storage } from '../storage-adapter.js'

let assignSpy
let location

beforeEach(() => {
  globalThis.localStorage.clear()
  assignSpy = vi.fn()
  location = { assign: assignSpy }
  document.body.innerHTML = ''
})

afterEach(() => {
  globalThis.localStorage.clear()
})

const installPayload = (text) => {
  document.body.innerHTML = `<script id="page-payload" type="application/json">${text}</script>`
}

describe('completeSignIn', () => {
  test('writes the email to storage and navigates to the dashboard', () => {
    installPayload('{"email":"a@b.com"}')

    expect(completeSignIn(document, location)).toBe(true)
    expect(storage.getCurrentUser()).toEqual({ email: 'a@b.com' })
    expect(assignSpy).toHaveBeenCalledWith(DASHBOARD_URL)
  })

  test('returns false and skips storage when payload missing', () => {
    expect(completeSignIn(document, location)).toBe(false)
    expect(storage.getCurrentUser()).toBeNull()
    expect(assignSpy).not.toHaveBeenCalled()
  })

  test('returns false when payload is present but has no email', () => {
    installPayload('{"foo":"bar"}')

    expect(completeSignIn(document, location)).toBe(false)
    expect(storage.getCurrentUser()).toBeNull()
    expect(assignSpy).not.toHaveBeenCalled()
  })
})
