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

  describe('single-member details hydration', () => {
    const members = [
      { id: 'm1', name: 'One Ltd', bprn: 'BPRN-111111', schemeRef: 'NPWD1' },
      { id: 'm2', name: 'Two Ltd', bprn: 'BPRN-222222', schemeRef: 'NPWD1' }
    ]
    const setDetailsBody = () => {
      document.body.innerHTML = `
        <select id="memberId"><option value=""></option><option value="m1">One</option><option value="m2">Two</option></select>
        <input id="bprn" />
        <script id="page-payload" type="application/json">${JSON.stringify({
          target: 'hydrate',
          step: 'singleMemberDetails',
          year: 2026,
          quarter: 2,
          members
        })}</script>`
    }

    test('does nothing when the BPRN field is missing', () => {
      document.body.innerHTML = `
        <select id="memberId"></select>
        <script id="page-payload" type="application/json">${JSON.stringify({
          target: 'hydrate',
          step: 'singleMemberDetails',
          year: 2026,
          quarter: 2,
          members
        })}</script>`

      expect(runPrototypeComplianceSchemeStep(document)).toBe('no-op')
    })

    test('restores the saved member and its BPRN from the draft', () => {
      storage.savePrototypeComplianceSchemeSubmissionDraft(2026, 2, {
        memberId: 'm2'
      })
      setDetailsBody()

      expect(runPrototypeComplianceSchemeStep(document)).toBe('hydrated')
      expect(document.getElementById('memberId').value).toBe('m2')
      expect(document.getElementById('bprn').value).toBe('BPRN-222222')
    })

    test('fills the BPRN when the member selection changes', () => {
      setDetailsBody()
      runPrototypeComplianceSchemeStep(document)

      const select = document.getElementById('memberId')
      select.value = 'm1'
      select.dispatchEvent(new Event('change'))
      expect(document.getElementById('bprn').value).toBe('BPRN-111111')

      select.value = ''
      select.dispatchEvent(new Event('change'))
      expect(document.getElementById('bprn').value).toBe('')
    })
  })
})
