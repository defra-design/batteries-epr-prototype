// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runOperatorSignIn } from './index.js'
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

describe('runOperatorSignIn', () => {
  test('on setCurrentOperatorId target, persists the id and navigates to nextStep', () => {
    installPayload({
      target: 'setCurrentOperatorId',
      operatorId: '33333333-0001-4000-a000-000000000001',
      nextStep: '/operator'
    })
    expect(runOperatorSignIn(document, { assign: assignSpy })).toBe(
      'navigated'
    )
    expect(storage.getCurrentOperatorId()).toBe(
      '33333333-0001-4000-a000-000000000001'
    )
    expect(assignSpy).toHaveBeenCalledWith('/operator')
  })

  test('on hydrate target, does nothing observable', () => {
    installPayload({ target: 'hydrate' })
    expect(runOperatorSignIn(document, { assign: assignSpy })).toBe('hydrated')
    expect(storage.getCurrentOperatorId()).toBeNull()
    expect(assignSpy).not.toHaveBeenCalled()
  })
})
