// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, test, vi } from 'vitest'

import { storage } from '../../storage-adapter.js'
import { runPrototypeComplianceSchemeStep } from './wizard-step.js'

const setBody = (payload) => {
  document.body.innerHTML = payload
    ? `<script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>`
    : ''
}

beforeEach(() => {
  globalThis.localStorage.clear()
})

afterEach(() => {
  globalThis.localStorage.clear()
  document.body.innerHTML = ''
})

describe('runPrototypeComplianceSchemeStep', () => {
  test('does nothing without a page payload', () => {
    setBody(null)
    expect(runPrototypeComplianceSchemeStep(document)).toBe('no-op')
  })

  test('does nothing when the payload target is not save', () => {
    setBody({ target: 'none' })
    expect(runPrototypeComplianceSchemeStep(document)).toBe('no-op')
    expect(
      storage.getPrototypeComplianceSchemeSubmissionDraft(2026, 2)
    ).toEqual({})
  })

  test('persists the saved fields for the given year and quarter', () => {
    setBody({
      target: 'save',
      year: 2026,
      quarter: 2,
      savedFields: { reportingMethod: 'single' }
    })

    expect(runPrototypeComplianceSchemeStep(document)).toBe('saved')
    expect(
      storage.getPrototypeComplianceSchemeSubmissionDraft(2026, 2)
    ).toEqual({ reportingMethod: 'single' })
  })

  test('persists and navigates when a nextStep is given', () => {
    setBody({
      target: 'save',
      year: 2026,
      quarter: 2,
      savedFields: { reportingMethod: 'bulk' },
      nextStep: '/next'
    })
    const loc = { assign: vi.fn() }

    expect(runPrototypeComplianceSchemeStep(document, loc)).toBe('navigated')
    expect(
      storage.getPrototypeComplianceSchemeSubmissionDraft(2026, 2)
    ).toEqual({ reportingMethod: 'bulk' })
    expect(loc.assign).toHaveBeenCalledWith('/next')
  })

  test('auto-advances to nextStep after the default delay without persisting', () => {
    setBody({ target: 'auto-advance', nextStep: '/errors' })
    const loc = { assign: vi.fn() }
    const wait = vi.fn()

    expect(runPrototypeComplianceSchemeStep(document, loc, wait)).toBe(
      'auto-advancing'
    )
    expect(wait).toHaveBeenCalledWith(expect.any(Function), 5000)
    expect(loc.assign).not.toHaveBeenCalled()

    wait.mock.calls[0][0]()
    expect(loc.assign).toHaveBeenCalledWith('/errors')
  })

  test('auto-advance honours a custom delayMs', () => {
    setBody({ target: 'auto-advance', nextStep: '/errors', delayMs: 1000 })
    const wait = vi.fn()

    runPrototypeComplianceSchemeStep(document, { assign: vi.fn() }, wait)
    expect(wait).toHaveBeenCalledWith(expect.any(Function), 1000)
  })
})
