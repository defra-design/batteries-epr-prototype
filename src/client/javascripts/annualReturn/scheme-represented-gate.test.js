// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { redirectIfSchemeRoute } from './scheme-represented-gate.js'
import { storage } from '../storage-adapter.js'

let loc

beforeEach(() => {
  globalThis.localStorage.clear()
  loc = { assign: vi.fn() }
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('redirectIfSchemeRoute', () => {
  test('returns false and does not redirect when no registrationId provided', () => {
    expect(redirectIfSchemeRoute(undefined, loc)).toBe(false)
    expect(loc.assign).not.toHaveBeenCalled()
  })

  test('returns false when registration does not exist', () => {
    expect(redirectIfSchemeRoute('missing-id', loc)).toBe(false)
    expect(loc.assign).not.toHaveBeenCalled()
  })

  test('returns false when registration is not on the scheme route', () => {
    const reg = storage.saveRegistration({
      compliancePeriod: '2026',
      producerRoute: 'smallProducer'
    })
    expect(redirectIfSchemeRoute(reg.id, loc)).toBe(false)
    expect(loc.assign).not.toHaveBeenCalled()
  })

  test('redirects to the scheme-represented page when route is complianceScheme', () => {
    const reg = storage.saveRegistration({
      compliancePeriod: '2026',
      producerRoute: 'complianceScheme'
    })
    expect(redirectIfSchemeRoute(reg.id, loc)).toBe(true)
    expect(loc.assign).toHaveBeenCalledWith(
      `/annual-return/${reg.id}/scheme-represented`
    )
  })
})
