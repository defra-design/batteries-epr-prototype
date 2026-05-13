// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { applyNavAuth } from './nav-auth.js'
import { storage } from './storage-adapter.js'

const buildNavDom = () => {
  document.body.innerHTML = `
    <ul>
      <li data-testid="nav-li-public"><a data-auth-state="always" data-testid="nav-public" href="/register/search">Public register</a></li>
      <li data-testid="nav-li-sign-in"><a data-auth-state="signed-out" data-testid="nav-sign-in" href="/sign-in">Sign in</a></li>
      <li data-testid="nav-li-account"><a data-auth-state="signed-in" data-testid="nav-account" href="/account">Manage account</a></li>
      <li data-testid="nav-li-sign-out"><a data-auth-state="signed-in" data-testid="nav-sign-out" href="/sign-out">Sign out</a></li>
    </ul>
  `
}

beforeEach(() => {
  globalThis.localStorage.clear()
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('applyNavAuth', () => {
  test('hides signed-in items when no current user', () => {
    buildNavDom()
    expect(applyNavAuth(document)).toBe(false)
    expect(document.querySelector('[data-testid="nav-li-public"]').hidden).toBe(
      false
    )
    expect(
      document.querySelector('[data-testid="nav-li-sign-in"]').hidden
    ).toBe(false)
    expect(
      document.querySelector('[data-testid="nav-li-account"]').hidden
    ).toBe(true)
    expect(
      document.querySelector('[data-testid="nav-li-sign-out"]').hidden
    ).toBe(true)
  })

  test('hides signed-out items when a user is set', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    buildNavDom()
    expect(applyNavAuth(document)).toBe(true)
    expect(document.querySelector('[data-testid="nav-li-public"]').hidden).toBe(
      false
    )
    expect(
      document.querySelector('[data-testid="nav-li-sign-in"]').hidden
    ).toBe(true)
    expect(
      document.querySelector('[data-testid="nav-li-account"]').hidden
    ).toBe(false)
    expect(
      document.querySelector('[data-testid="nav-li-sign-out"]').hidden
    ).toBe(false)
  })

  test('treats a user with no email as signed-out', () => {
    storage.setCurrentUser({ email: '' })
    buildNavDom()
    expect(applyNavAuth(document)).toBe(false)
    expect(
      document.querySelector('[data-testid="nav-li-account"]').hidden
    ).toBe(true)
  })

  test('falls back to hiding the link itself when there is no parent <li>', () => {
    document.body.innerHTML = `
      <a data-auth-state="signed-in" data-testid="orphan-account" href="/account">Account</a>
      <a data-auth-state="signed-out" data-testid="orphan-sign-in" href="/sign-in">Sign in</a>
    `
    applyNavAuth(document)
    expect(
      document.querySelector('[data-testid="orphan-account"]').hidden
    ).toBe(true)
    expect(
      document.querySelector('[data-testid="orphan-sign-in"]').hidden
    ).toBe(false)
  })
})
