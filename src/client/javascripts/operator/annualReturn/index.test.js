// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runOperatorAnnualReturnStep } from './index.js'
import {
  storage,
  createOperator,
  createOperatorAnnualReturn
} from '../../storage-adapter.js'

const TONNAGE_FIELDS = [
  'industrialAcceptedLeadAcid',
  'industrialAcceptedNickelCadmium',
  'industrialAcceptedOther',
  'industrialTreatedLeadAcid',
  'industrialTreatedNickelCadmium',
  'industrialTreatedOther',
  'automotiveAcceptedLeadAcid',
  'automotiveAcceptedNickelCadmium',
  'automotiveAcceptedOther',
  'automotiveTreatedLeadAcid',
  'automotiveTreatedNickelCadmium',
  'automotiveTreatedOther'
]

const buildDom = (payload, formHtml = '') => {
  document.body.innerHTML = `
    ${formHtml}
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

const tonnageFormHtml = () => {
  const fields = TONNAGE_FIELDS.map(
    (name) => `<input name="${name}" />`
  ).join('')
  return `<form>${fields}</form>`
}

let assignSpy

const seedOperator = (overrides = {}) => {
  const op = createOperator({
    id: 'op-annual-001',
    name: 'Test Operator',
    approvalType: 'abto',
    approvalStatus: 'approved',
    batteryTypes: {
      isPortable: false,
      isIndustrial: true,
      isAutomotive: true
    },
    ...overrides
  })
  storage.saveOperator(op)
  storage.setCurrentOperatorId(op.id)
  return op
}

beforeEach(() => {
  globalThis.localStorage.clear()
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

describe('runOperatorAnnualReturnStep persist target', () => {
  test('persists the patch and navigates to next', () => {
    seedOperator()
    const patch = {
      industrial: {
        accepted: {
          leadAcid: '1.000',
          nickelCadmium: '0.000',
          other: '0.000'
        },
        treated: {
          leadAcid: '0.500',
          nickelCadmium: '0.000',
          other: '0.000'
        }
      },
      automotive: {
        accepted: {
          leadAcid: '0.000',
          nickelCadmium: '0.000',
          other: '0.000'
        },
        treated: {
          leadAcid: '0.000',
          nickelCadmium: '0.000',
          other: '0.000'
        }
      },
      status: 'in-progress'
    }
    buildDom({
      step: 'tonnages',
      target: 'persist',
      compliancePeriodYear: '2026',
      patch,
      next: '/operator/annual-return/declaration'
    })

    expect(runOperatorAnnualReturnStep(document, globalThis.location)).toBe(
      'navigated'
    )
    const saved = storage.findOperatorAnnualReturn('op-annual-001', '2026')
    expect(saved.status).toBe('in-progress')
    expect(saved.industrial.accepted.leadAcid).toBe('1.000')
    expect(assignSpy).toHaveBeenCalledWith('/operator/annual-return/declaration')
  })

  test('persists without navigating when next is null', () => {
    seedOperator()
    buildDom({
      step: 'confirmation',
      target: 'persist',
      compliancePeriodYear: '2026',
      patch: {},
      next: null
    })

    expect(runOperatorAnnualReturnStep(document, globalThis.location)).toBe(
      'persisted'
    )
    expect(assignSpy).not.toHaveBeenCalled()
  })
})

describe('runOperatorAnnualReturnStep hydrate target', () => {
  test('hydrates tonnages form from existing return', () => {
    const op = seedOperator()
    storage.upsertOperatorAnnualReturn(op.id, '2026', {
      industrial: {
        accepted: {
          leadAcid: '5.000',
          nickelCadmium: '3.000',
          other: '1.000'
        },
        treated: {
          leadAcid: '2.000',
          nickelCadmium: '1.000',
          other: '0.500'
        }
      },
      automotive: {
        accepted: {
          leadAcid: '4.000',
          nickelCadmium: '2.000',
          other: '0.000'
        },
        treated: {
          leadAcid: '1.500',
          nickelCadmium: '0.000',
          other: '0.000'
        }
      },
      status: 'in-progress'
    })
    buildDom(
      { step: 'tonnages', target: 'hydrate', compliancePeriodYear: '2026' },
      tonnageFormHtml()
    )

    expect(runOperatorAnnualReturnStep(document, globalThis.location)).toBe(
      'hydrated'
    )
    expect(
      document.querySelector('input[name="industrialAcceptedLeadAcid"]').value
    ).toBe('5.000')
    expect(
      document.querySelector('input[name="automotiveAcceptedLeadAcid"]').value
    ).toBe('4.000')
    expect(
      document.querySelector('input[name="automotiveTreatedOther"]').value
    ).toBe('0.000')
  })

  test('hydrates tonnages with defaults when no existing return', () => {
    seedOperator()
    buildDom(
      { step: 'tonnages', target: 'hydrate', compliancePeriodYear: '2026' },
      tonnageFormHtml()
    )

    expect(runOperatorAnnualReturnStep(document, globalThis.location)).toBe(
      'hydrated'
    )
    expect(
      document.querySelector('input[name="industrialAcceptedLeadAcid"]').value
    ).toBe('')
  })

  test('hydrate tonnages without form does not error', () => {
    seedOperator()
    storage.upsertOperatorAnnualReturn('op-annual-001', '2026', {
      status: 'in-progress'
    })
    buildDom({
      step: 'tonnages',
      target: 'hydrate',
      compliancePeriodYear: '2026'
    })

    expect(runOperatorAnnualReturnStep(document, globalThis.location)).toBe(
      'hydrated'
    )
  })

  test('declaration step returns hydrated without form interaction', () => {
    seedOperator()
    buildDom(
      { step: 'declaration', target: 'hydrate', compliancePeriodYear: '2026' },
      '<form><input type="checkbox" name="declarationAccepted" value="yes" /></form>'
    )

    expect(runOperatorAnnualReturnStep(document, globalThis.location)).toBe(
      'hydrated'
    )
  })

  test('confirmation step returns hydrated', () => {
    seedOperator()
    buildDom({
      step: 'confirmation',
      target: 'hydrate',
      compliancePeriodYear: '2026'
    })

    expect(runOperatorAnnualReturnStep(document, globalThis.location)).toBe(
      'hydrated'
    )
  })

  test('redirects to sign-in when no current operator', () => {
    buildDom(
      { step: 'tonnages', target: 'hydrate', compliancePeriodYear: '2026' },
      tonnageFormHtml()
    )

    expect(runOperatorAnnualReturnStep(document, globalThis.location)).toBe(
      'redirected-to-sign-in'
    )
    expect(assignSpy).toHaveBeenCalledWith('/operator/sign-in')
  })
})

describe('createOperatorAnnualReturn', () => {
  test('creates default annual return with chemistry defaults', () => {
    const ret = createOperatorAnnualReturn()
    expect(ret.id).toBeTruthy()
    expect(ret.status).toBe('not-started')
    expect(ret.industrial.accepted.leadAcid).toBe('0.000')
    expect(ret.industrial.accepted.nickelCadmium).toBe('0.000')
    expect(ret.industrial.accepted.other).toBe('0.000')
    expect(ret.industrial.treated.leadAcid).toBe('0.000')
    expect(ret.automotive.accepted.leadAcid).toBe('0.000')
    expect(ret.automotive.treated.other).toBe('0.000')
    expect(ret.submittedOn).toBeNull()
  })

  test('creates annual return with provided values', () => {
    const ret = createOperatorAnnualReturn({
      operatorId: 'op-1',
      compliancePeriodYear: '2026',
      industrial: {
        accepted: { leadAcid: '5.000' }
      }
    })
    expect(ret.operatorId).toBe('op-1')
    expect(ret.compliancePeriodYear).toBe('2026')
    expect(ret.industrial.accepted.leadAcid).toBe('5.000')
    expect(ret.industrial.accepted.nickelCadmium).toBe('0.000')
  })
})
