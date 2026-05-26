// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runRegulatorSignIn } from './index.js'
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

describe('runRegulatorSignIn', () => {
  test('on setCurrentAgencyCode target, persists the code and navigates to nextStep', () => {
    installPayload({
      target: 'setCurrentAgencyCode',
      agencyCode: 'EA',
      nextStep: '/regulator'
    })
    expect(runRegulatorSignIn(document, { assign: assignSpy })).toBe(
      'navigated'
    )
    expect(storage.getCurrentAgencyCode()).toBe('EA')
    expect(assignSpy).toHaveBeenCalledWith('/regulator')
  })

  test('on hydrate target, does nothing observable', () => {
    installPayload({ target: 'hydrate' })
    expect(runRegulatorSignIn(document, { assign: assignSpy })).toBe('hydrated')
    expect(storage.getCurrentAgencyCode()).toBeNull()
    expect(assignSpy).not.toHaveBeenCalled()
  })
})
