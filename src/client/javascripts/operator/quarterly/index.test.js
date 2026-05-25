// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runOperatorQuarterlyStep } from './index.js'
import { storage, createOperator } from '../../storage-adapter.js'

const buildDom = (payload, formHtml = '') => {
  document.body.innerHTML = `
    ${formHtml}
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

const buildTonnageFormDom = (payload) => {
  document.body.innerHTML = `
    <form>
      <input name="acceptedLeadAcid" />
      <input name="acceptedNickelCadmium" />
      <input name="acceptedOther" />
      <input name="treatedLeadAcid" />
      <input name="treatedNickelCadmium" />
      <input name="treatedOther" />
    </form>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

let assignSpy
let operator

const seedOperator = (overrides = {}) => {
  const op = createOperator({
    id: '44444444-0001-4000-a000-000000000001',
    name: 'Test Operator Ltd',
    approvalType: 'abto',
    approvalStatus: 'approved',
    batteryTypes: { isPortable: true, isIndustrial: false, isAutomotive: false },
    ...overrides
  })
  storage.saveOperator(op)
  storage.setCurrentOperatorId(op.id)
  return op
}

beforeEach(() => {
  globalThis.localStorage.clear()
  storage.seedDemoData()
  operator = seedOperator()
  assignSpy = vi.fn()
  Object.defineProperty(globalThis, 'location', {
    value: { assign: assignSpy, reload: vi.fn() },
    writable: true,
    configurable: true
  })
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('runOperatorQuarterlyStep redirect', () => {
  test('redirects to sign-in when no current operator', () => {
    storage.clearCurrentOperatorId()
    buildDom({
      view: 'operatorQuarterly',
      step: 'tonnages',
      quarter: 'Q1',
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })
    expect(runOperatorQuarterlyStep(document, globalThis.location)).toBe(
      'redirected-to-sign-in'
    )
    expect(assignSpy).toHaveBeenCalledWith('/operator/sign-in')
  })
})

describe('runOperatorQuarterlyStep persist', () => {
  test('persists tonnage patch and navigates to next', () => {
    buildDom({
      view: 'operatorQuarterly',
      step: 'tonnages',
      quarter: 'Q1',
      compliancePeriodYear: '2026',
      target: 'persist',
      patch: {
        accepted: { leadAcid: '1.000', nickelCadmium: '2.000', other: '3.000' },
        treated: { leadAcid: '4.000', nickelCadmium: '5.000', other: '6.000' },
        status: 'in-progress'
      },
      next: '/operator/quarterly/Q1/declaration'
    })

    expect(runOperatorQuarterlyStep(document, globalThis.location)).toBe('navigated')
    expect(assignSpy).toHaveBeenCalledWith('/operator/quarterly/Q1/declaration')

    const ret = storage.findOperatorQuarterlyReturn(operator.id, '2026', 'Q1')
    expect(ret.status).toBe('in-progress')
    expect(ret.accepted.leadAcid).toBe('1.000')
  })

  test('persists declaration patch and navigates', () => {
    buildDom({
      view: 'operatorQuarterly',
      step: 'declaration',
      quarter: 'Q2',
      compliancePeriodYear: '2026',
      target: 'persist',
      patch: { status: 'submitted', submittedOn: '2026-07-01T00:00:00Z' },
      next: '/operator/quarterly/Q2/confirmation'
    })

    expect(runOperatorQuarterlyStep(document, globalThis.location)).toBe('navigated')
    const ret = storage.findOperatorQuarterlyReturn(operator.id, '2026', 'Q2')
    expect(ret.status).toBe('submitted')
  })

  test('persist without next returns persisted without navigating', () => {
    buildDom({
      view: 'operatorQuarterly',
      step: 'tonnages',
      quarter: 'Q1',
      compliancePeriodYear: '2026',
      target: 'persist',
      patch: { status: 'in-progress' },
      next: null
    })
    expect(runOperatorQuarterlyStep(document, globalThis.location)).toBe('persisted')
    expect(assignSpy).not.toHaveBeenCalled()
  })
})

describe('runOperatorQuarterlyStep hydrate', () => {
  test('tonnages step hydrates form with existing data', () => {
    storage.upsertOperatorQuarterlyReturn(operator.id, '2026', 'Q1', {
      accepted: { leadAcid: '1.500', nickelCadmium: '2.500', other: '3.500' },
      treated: { leadAcid: '4.500', nickelCadmium: '5.500', other: '6.500' },
      status: 'in-progress'
    })

    buildTonnageFormDom({
      view: 'operatorQuarterly',
      step: 'tonnages',
      quarter: 'Q1',
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })

    expect(runOperatorQuarterlyStep(document, globalThis.location)).toBe('hydrated')
    expect(document.querySelector('input[name="acceptedLeadAcid"]').value).toBe('1.500')
    expect(document.querySelector('input[name="treatedOther"]').value).toBe('6.500')
  })

  test('tonnages step with no existing data does not populate form', () => {
    buildTonnageFormDom({
      view: 'operatorQuarterly',
      step: 'tonnages',
      quarter: 'Q3',
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })

    expect(runOperatorQuarterlyStep(document, globalThis.location)).toBe('hydrated')
    expect(document.querySelector('input[name="acceptedLeadAcid"]').value).toBe('')
  })

  test('declaration step marks checkbox when status is submitted', () => {
    storage.upsertOperatorQuarterlyReturn(operator.id, '2026', 'Q1', {
      status: 'submitted'
    })

    buildDom(
      {
        view: 'operatorQuarterly',
        step: 'declaration',
        quarter: 'Q1',
        compliancePeriodYear: '2026',
        target: 'hydrate'
      },
      '<form><input type="checkbox" name="declarationAccepted" value="yes" /></form>'
    )

    runOperatorQuarterlyStep(document, globalThis.location)
    expect(
      document.querySelector('input[name="declarationAccepted"]').checked
    ).toBe(true)
  })

  test('declaration step leaves checkbox unchecked when not submitted', () => {
    buildDom(
      {
        view: 'operatorQuarterly',
        step: 'declaration',
        quarter: 'Q1',
        compliancePeriodYear: '2026',
        target: 'hydrate'
      },
      '<form><input type="checkbox" name="declarationAccepted" value="yes" /></form>'
    )

    runOperatorQuarterlyStep(document, globalThis.location)
    expect(
      document.querySelector('input[name="declarationAccepted"]').checked
    ).toBe(false)
  })

  test('confirmation step returns hydrated', () => {
    buildDom({
      view: 'operatorQuarterly',
      step: 'confirmation',
      quarter: 'Q1',
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })
    expect(runOperatorQuarterlyStep(document, globalThis.location)).toBe('hydrated')
  })
})
