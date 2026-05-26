// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runRegulatorOperatorWithdraw } from './index.js'
import { storage } from '../../../storage-adapter.js'

const withdrawHtml = (payload) => `
  <p data-testid="operator-withdraw-name" hidden></p>
  <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
`

let assignSpy

beforeEach(() => {
  globalThis.localStorage.clear()
  assignSpy = vi.fn()
  storage.seedDemoData()
  storage.setCurrentAgencyCode('EA')
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('runRegulatorOperatorWithdraw', () => {
  test('hydrates operator name when operator exists', () => {
    const approved = storage.listOperators().find((o) => o.approvalStatus === 'approved')
    document.body.innerHTML = withdrawHtml({
      view: 'withdraw',
      target: 'hydrate',
      operatorId: approved.id
    })
    const result = runRegulatorOperatorWithdraw(document, { assign: assignSpy })
    expect(result).toBe('hydrated')
    const nameEl = document.querySelector('[data-testid="operator-withdraw-name"]')
    expect(nameEl.textContent).toBe(approved.name)
    expect(nameEl.hidden).toBe(false)
  })

  test('hydrates without error when operator does not exist', () => {
    document.body.innerHTML = withdrawHtml({
      view: 'withdraw',
      target: 'hydrate',
      operatorId: 'nonexistent-id'
    })
    const result = runRegulatorOperatorWithdraw(document, { assign: assignSpy })
    expect(result).toBe('hydrated')
  })

  test('persist calls withdrawOperatorApproval and navigates', () => {
    const approved = storage.listOperators().find((o) => o.approvalStatus === 'approved')
    document.body.innerHTML = withdrawHtml({
      view: 'withdraw',
      target: 'persist',
      operatorId: approved.id,
      reason: 'Breach of conditions'
    })
    const result = runRegulatorOperatorWithdraw(document, { assign: assignSpy })
    expect(result).toBe('navigated')
    expect(assignSpy).toHaveBeenCalledWith('/regulator/operators')
    const updated = storage.getOperator(approved.id)
    expect(updated.approvalStatus).toBe('withdrawn')
    expect(updated.withdrawalReason).toBe('Breach of conditions')
  })
})
