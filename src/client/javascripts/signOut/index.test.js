// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { completeSignOut, DEFAULT_SIGNED_OUT_URL } from './index.js'
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

describe('completeSignOut', () => {
  test('clears the current user and navigates to the page-payload URL', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    document.body.innerHTML = `<script id="page-payload" type="application/json">{"signedOutUrl":"/custom-signed-out"}</script>`

    completeSignOut(document, location)

    expect(storage.getCurrentUser()).toBeNull()
    expect(assignSpy).toHaveBeenCalledWith('/custom-signed-out')
  })

  test('falls back to the default signed-out URL when payload missing', () => {
    storage.setCurrentUser({ email: 'a@b.com' })

    completeSignOut(document, location)

    expect(storage.getCurrentUser()).toBeNull()
    expect(assignSpy).toHaveBeenCalledWith(DEFAULT_SIGNED_OUT_URL)
  })
})
