// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runOperatorRegister } from './index.js'
import { storage, createScheme } from '../../storage-adapter.js'

const OPTIONS_TESTID = 'operator-register-options'
const EA_SCHEME_ID = '22222222-0001-4000-a000-000000000001'

const installPayload = (payload) => {
  document.body.innerHTML = `
    <div data-testid="${OPTIONS_TESTID}"></div>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

let assignSpy

beforeEach(() => {
  globalThis.localStorage.clear()
  assignSpy = vi.fn()
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('runOperatorRegister', () => {
  test('on hydrate, lists approved schemes with their regulator as a hint', () => {
    installPayload({ target: 'hydrate' })
    storage.seedDemoData()
    storage.saveScheme(
      createScheme({
        name: 'Batteries & More Ltd',
        agencyCode: 'NRW',
        approvalStatus: 'approved'
      })
    )
    expect(runOperatorRegister(document, { assign: assignSpy })).toBe(
      'hydrated'
    )

    const radio = document.querySelector(
      `[data-testid="operator-register-radio-${EA_SCHEME_ID}"]`
    )
    expect(radio).not.toBeNull()
    const container = document.querySelector(
      `[data-testid="${OPTIONS_TESTID}"]`
    )
    expect(container.innerHTML).toContain('Environment Agency')
    expect(container.innerHTML).toContain('Natural Resources Wales')
    expect(container.innerHTML).toContain('Batteries &amp; More Ltd')
    expect(assignSpy).not.toHaveBeenCalled()
  })

  test('on create, mints a pending operator under the scheme and its regulator, then navigates', () => {
    storage.seedDemoData()
    installPayload({
      target: 'create',
      schemeId: EA_SCHEME_ID,
      nextStep: '/operator/application/operator-details'
    })

    expect(runOperatorRegister(document, { assign: assignSpy })).toBe('created')

    const operatorId = storage.getCurrentOperatorId()
    const operator = storage.getOperator(operatorId)
    expect(operator.schemeId).toBe(EA_SCHEME_ID)
    expect(operator.agencyCode).toBe('EA')
    expect(operator.schemeApprovalStatus).toBe('pending')
    expect(operator.approvalStatus).toBe('in-progress')
    expect(assignSpy).toHaveBeenCalledWith(
      '/operator/application/operator-details'
    )
  })
})
