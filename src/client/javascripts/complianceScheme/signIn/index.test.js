// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runSchemeSignIn } from './index.js'
import { storage } from '../../storage-adapter.js'

const installPayload = (payload) => {
  document.body.innerHTML = `<script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>`
}

let assignSpy

beforeEach(() => {
  globalThis.localStorage.clear()
  assignSpy = vi.fn()
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('runSchemeSignIn', () => {
  test('on setCurrentSchemeId target, persists the id and navigates to nextStep', () => {
    installPayload({
      target: 'setCurrentSchemeId',
      schemeId: '22222222-0001-4000-a000-000000000001',
      nextStep: '/compliance-scheme'
    })
    expect(runSchemeSignIn(document, { assign: assignSpy })).toBe('navigated')
    expect(storage.getCurrentSchemeId()).toBe(
      '22222222-0001-4000-a000-000000000001'
    )
    expect(assignSpy).toHaveBeenCalledWith('/compliance-scheme')
  })

  test('on hydrate target, does nothing observable', () => {
    installPayload({ target: 'hydrate' })
    expect(runSchemeSignIn(document, { assign: assignSpy })).toBe('hydrated')
    expect(storage.getCurrentSchemeId()).toBeNull()
    expect(assignSpy).not.toHaveBeenCalled()
  })
})
