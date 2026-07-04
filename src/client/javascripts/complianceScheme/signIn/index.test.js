// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runSchemeSignIn } from './index.js'
import { storage, createScheme } from '../../storage-adapter.js'

const OPTIONS_TESTID = 'compliance-scheme-sign-in-options'

const installPayload = (payload) => {
  document.body.innerHTML = `
    <div data-testid="${OPTIONS_TESTID}"></div>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

const radioTestId = (schemeId) =>
  `[data-testid="compliance-scheme-sign-in-radio-${schemeId}"]`

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

  test('on hydrate, lists only approved schemes from storage', () => {
    installPayload({ target: 'hydrate' })
    const approvedNoOperator = storage.saveScheme(
      createScheme({
        name: 'Freshly & Approved Ltd',
        agencyCode: 'NRW',
        approvalStatus: 'approved',
        operator: null
      })
    )
    const notApproved = storage.saveScheme(
      createScheme({
        name: 'Still Pending Ltd',
        agencyCode: 'NRW',
        approvalStatus: 'submitted'
      })
    )

    expect(runSchemeSignIn(document, { assign: assignSpy })).toBe('hydrated')

    expect(
      document.querySelector(
        radioTestId('22222222-0001-4000-a000-000000000001')
      )
    ).not.toBeNull()
    expect(
      document.querySelector(radioTestId(approvedNoOperator.id))
    ).not.toBeNull()
    expect(document.querySelector(radioTestId(notApproved.id))).toBeNull()

    const container = document.querySelector(
      `[data-testid="${OPTIONS_TESTID}"]`
    )
    expect(container.innerHTML).toContain('Freshly &amp; Approved Ltd')
    expect(container.innerHTML).toContain('govuk-radios__hint')
    expect(assignSpy).not.toHaveBeenCalled()
  })
})
