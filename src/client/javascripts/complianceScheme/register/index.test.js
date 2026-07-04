// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runSchemeRegister } from './index.js'
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

describe('runSchemeRegister', () => {
  test('on create target, creates a submitted-ready scheme for the agency and navigates', () => {
    installPayload({
      target: 'create',
      agencyCode: 'NRW',
      nextStep: '/compliance-scheme/application/scheme-details'
    })

    expect(runSchemeRegister(document, { assign: assignSpy })).toBe('navigated')

    const schemeId = storage.getCurrentSchemeId()
    expect(schemeId).toBeTruthy()
    const scheme = storage.getScheme(schemeId)
    expect(scheme.agencyCode).toBe('NRW')
    expect(scheme.approvalStatus).toBe('in-progress')
    expect(assignSpy).toHaveBeenCalledWith(
      '/compliance-scheme/application/scheme-details'
    )
  })

  test('on any other target, does nothing observable', () => {
    installPayload({ target: 'hydrate' })
    expect(runSchemeRegister(document, { assign: assignSpy })).toBe('hydrated')
    expect(storage.getCurrentSchemeId()).toBeNull()
    expect(assignSpy).not.toHaveBeenCalled()
  })
})
