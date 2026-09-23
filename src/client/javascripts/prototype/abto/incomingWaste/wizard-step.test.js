// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { storage } from '../../../storage-adapter.js'
import { runPrototypeAbtoIncomingWasteStep } from './wizard-step.js'

const payload = {
  step: 'dashboard',
  operatorName: 'Halton Battery Processing Ltd',
  verifyAction: 'Verify',
  compareUrlTemplate: '/compare/{deliveryId}'
}

const setBody = (value) => {
  document.body.innerHTML = `
    <script id="page-payload" type="application/json">${JSON.stringify(value)}</script>
    <table data-testid="abto-dashboard-table"><tbody></tbody></table>`
}

beforeEach(() => {
  globalThis.localStorage.clear()
})

afterEach(() => {
  globalThis.localStorage.clear()
  document.body.innerHTML = ''
})

describe('runPrototypeAbtoIncomingWasteStep', () => {
  test('does nothing without a page payload', () => {
    document.body.innerHTML = ''
    expect(runPrototypeAbtoIncomingWasteStep(document)).toBe('no-payload')
  })

  test('does nothing on a step other than dashboard', () => {
    setBody({ step: 'compare' })
    expect(runPrototypeAbtoIncomingWasteStep(document)).toBe('hydrated')
  })

  test('shows the delivery a scheme submission handed over, end to end', () => {
    storage.savePrototypeWasteData({
      collectedTonnes: '80.900',
      deliveredTonnes: '60.250'
    })
    const submitted = storage.submitPrototypeWasteData({
      schemeName: 'IronWave Compliance',
      submittedBy: 'Priya Shah',
      receivingOperator: 'Halton Battery Processing Ltd'
    })
    setBody(payload)

    expect(runPrototypeAbtoIncomingWasteStep(document)).toBe('hydrated')
    expect(
      document.querySelector(
        `[data-testid="abto-dashboard-row-${submitted.batchId}"]`
      ).textContent
    ).toContain('60.250t')
  })
})
