// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runRegulatorSchemeWithdraw } from './index.js'
import { storage } from '../../../storage-adapter.js'

const withdrawHtml = (payload) => `
  <p data-testid="scheme-withdraw-name" hidden></p>
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

describe('runRegulatorSchemeWithdraw', () => {
  test('hydrates scheme name when scheme exists', () => {
    const approved = storage.listSchemes().find((s) => s.approvalStatus === 'approved')
    document.body.innerHTML = withdrawHtml({
      view: 'withdraw',
      target: 'hydrate',
      schemeId: approved.id
    })
    const result = runRegulatorSchemeWithdraw(document, { assign: assignSpy })
    expect(result).toBe('hydrated')
    const nameEl = document.querySelector('[data-testid="scheme-withdraw-name"]')
    expect(nameEl.textContent).toBe(approved.name)
    expect(nameEl.hidden).toBe(false)
  })

  test('hydrates without error when scheme does not exist', () => {
    document.body.innerHTML = withdrawHtml({
      view: 'withdraw',
      target: 'hydrate',
      schemeId: 'nonexistent-id'
    })
    const result = runRegulatorSchemeWithdraw(document, { assign: assignSpy })
    expect(result).toBe('hydrated')
  })

  test('persist calls withdrawSchemeApproval and navigates', () => {
    const approved = storage.listSchemes().find((s) => s.approvalStatus === 'approved')
    document.body.innerHTML = withdrawHtml({
      view: 'withdraw',
      target: 'persist',
      schemeId: approved.id,
      reason: 'Non-compliance with regulations'
    })
    const result = runRegulatorSchemeWithdraw(document, { assign: assignSpy })
    expect(result).toBe('navigated')
    expect(assignSpy).toHaveBeenCalledWith('/regulator/schemes')
    const updated = storage.getScheme(approved.id)
    expect(updated.approvalStatus).toBe('withdrawn')
    expect(updated.withdrawalReason).toBe('Non-compliance with regulations')
  })
})
