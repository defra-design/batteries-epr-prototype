// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runOperatorSignIn } from './index.js'
import { storage, createOperator } from '../../storage-adapter.js'

const OPTIONS_TESTID = 'operator-sign-in-options'
const SEEDED_OPERATOR_ID = '33333333-0001-4000-a000-000000000001'

const installPayload = (payload) => {
  document.body.innerHTML = `
    <div data-testid="${OPTIONS_TESTID}"></div>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

const radioTestId = (operatorId) =>
  `[data-testid="operator-sign-in-radio-${operatorId}"]`

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
      operatorId: SEEDED_OPERATOR_ID,
      nextStep: '/operator'
    })
    expect(runOperatorSignIn(document, { assign: assignSpy })).toBe('navigated')
    expect(storage.getCurrentOperatorId()).toBe(SEEDED_OPERATOR_ID)
    expect(assignSpy).toHaveBeenCalledWith('/operator')
  })

  test('on hydrate, lists only dual-approved operators from storage', () => {
    installPayload({ target: 'hydrate' })
    const dualApproved = storage.saveOperator(
      createOperator({
        name: 'Recovery & Sons',
        approvalType: 'abe',
        approvalNumber: 'ABE-EA-2026-000009',
        approvalStatus: 'approved',
        schemeApprovalStatus: 'approved'
      })
    )
    const schemePending = storage.saveOperator(
      createOperator({
        name: 'Awaiting Scheme Ltd',
        approvalStatus: 'approved',
        schemeApprovalStatus: 'pending'
      })
    )

    expect(runOperatorSignIn(document, { assign: assignSpy })).toBe('hydrated')

    expect(
      document.querySelector(radioTestId(SEEDED_OPERATOR_ID))
    ).not.toBeNull()
    expect(document.querySelector(radioTestId(dualApproved.id))).not.toBeNull()
    expect(document.querySelector(radioTestId(schemePending.id))).toBeNull()

    const container = document.querySelector(
      `[data-testid="${OPTIONS_TESTID}"]`
    )
    expect(container.innerHTML).toContain('Recovery &amp; Sons')
    expect(container.innerHTML).toContain('ABE —')
    expect(container.innerHTML).toContain('ABTO —')
    expect(assignSpy).not.toHaveBeenCalled()
  })
})
