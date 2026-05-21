// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runQuarterlyStep } from './index.js'
import { storage } from '../../storage-adapter.js'

const buildDom = (payload, formHtml = '') => {
  document.body.innerHTML = `
    ${formHtml}
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

const buildCheckDom = (payload) => {
  document.body.innerHTML = `
    <dd data-testid="quarterly-check-market-portable"></dd>
    <dd data-testid="quarterly-check-market-industrial"></dd>
    <dd data-testid="quarterly-check-market-automotive"></dd>
    <dd data-testid="quarterly-check-waste-portable"></dd>
    <dd data-testid="quarterly-check-waste-industrial"></dd>
    <dd data-testid="quarterly-check-waste-automotive"></dd>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

let assignSpy

beforeEach(() => {
  globalThis.localStorage.clear()
  storage.seedDemoData()
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

describe('runQuarterlyStep persist', () => {
  test('upserts marketData on (schemeId, year, quarter) and navigates', () => {
    buildDom({
      view: 'quarterly',
      step: 'market-data',
      quarter: 'Q1',
      compliancePeriodYear: '2026',
      target: 'persist',
      patch: { marketData: { portable: '1', industrial: '2', automotive: '3' } },
      next: '/compliance-scheme/quarterly/Q1/waste-data'
    })

    expect(runQuarterlyStep(document, globalThis.location)).toBe('navigated')

    const [scheme] = storage.listSchemes()
    const submission = storage.findQuarterlySubmission(scheme.id, '2026', 'Q1')
    expect(submission.marketData).toEqual({
      portable: '1',
      industrial: '2',
      automotive: '3'
    })
    expect(assignSpy).toHaveBeenCalledWith(
      '/compliance-scheme/quarterly/Q1/waste-data'
    )
  })

  test('declaration patch sets status=submitted and submittedOn', () => {
    const [scheme] = storage.listSchemes()
    storage.upsertQuarterlySubmission(scheme.id, '2026', 'Q1', {
      marketData: { portable: '1', industrial: '0', automotive: '0' }
    })

    buildDom({
      view: 'quarterly',
      step: 'declaration',
      quarter: 'Q1',
      compliancePeriodYear: '2026',
      target: 'persist',
      patch: { status: 'submitted', submittedOn: '2026-05-01T00:00:00Z' },
      next: '/compliance-scheme/quarterly/Q1/confirmation'
    })

    runQuarterlyStep(document, globalThis.location)

    const submission = storage.findQuarterlySubmission(scheme.id, '2026', 'Q1')
    expect(submission.status).toBe('submitted')
    expect(submission.submittedOn).toBe('2026-05-01T00:00:00Z')
    expect(submission.marketData.portable).toBe('1')
  })

  test('persist without next returns persisted without navigating', () => {
    buildDom({
      view: 'quarterly',
      step: 'market-data',
      quarter: 'Q1',
      compliancePeriodYear: '2026',
      target: 'persist',
      patch: { marketData: { portable: '0', industrial: '0', automotive: '0' } },
      next: null
    })
    expect(runQuarterlyStep(document, globalThis.location)).toBe('persisted')
    expect(assignSpy).not.toHaveBeenCalled()
  })

  test('persist isolates submissions by year', () => {
    const [scheme] = storage.listSchemes()
    buildDom({
      view: 'quarterly',
      step: 'market-data',
      quarter: 'Q1',
      compliancePeriodYear: '2026',
      target: 'persist',
      patch: { marketData: { portable: '1', industrial: '0', automotive: '0' } },
      next: null
    })
    runQuarterlyStep(document, globalThis.location)

    buildDom({
      view: 'quarterly',
      step: 'market-data',
      quarter: 'Q1',
      compliancePeriodYear: '2027',
      target: 'persist',
      patch: { marketData: { portable: '9', industrial: '0', automotive: '0' } },
      next: null
    })
    runQuarterlyStep(document, globalThis.location)

    expect(
      storage.findQuarterlySubmission(scheme.id, '2026', 'Q1').marketData
        .portable
    ).toBe('1')
    expect(
      storage.findQuarterlySubmission(scheme.id, '2027', 'Q1').marketData
        .portable
    ).toBe('9')
  })
})

describe('runQuarterlyStep hydrate', () => {
  test('market-data hydrates from existing marketData when present', () => {
    const [scheme] = storage.listSchemes()
    storage.upsertQuarterlySubmission(scheme.id, '2026', 'Q1', {
      marketData: { portable: '1', industrial: '2', automotive: '3' }
    })

    buildDom(
      {
        view: 'quarterly',
        step: 'market-data',
        quarter: 'Q1',
        compliancePeriodYear: '2026',
        target: 'hydrate'
      },
      '<form><input name="portable" /><input name="industrial" /><input name="automotive" /></form>'
    )
    expect(runQuarterlyStep(document, globalThis.location)).toBe('hydrated')
    expect(document.querySelector('input[name="portable"]').value).toBe('1')
    expect(document.querySelector('input[name="industrial"]').value).toBe('2')
    expect(document.querySelector('input[name="automotive"]').value).toBe('3')
  })

  test('waste-data hydrate is a no-op when only marketData has been entered', () => {
    const [scheme] = storage.listSchemes()
    storage.upsertQuarterlySubmission(scheme.id, '2026', 'Q1', {
      marketData: { portable: '1', industrial: '0', automotive: '0' }
    })
    buildDom(
      {
        view: 'quarterly',
        step: 'waste-data',
        quarter: 'Q1',
        compliancePeriodYear: '2026',
        target: 'hydrate'
      },
      '<form><input name="portable" /></form>'
    )
    runQuarterlyStep(document, globalThis.location)
    expect(document.querySelector('input[name="portable"]').value).toBe('')
  })

  test('waste-data hydrates from existing wasteData when present', () => {
    const [scheme] = storage.listSchemes()
    storage.upsertQuarterlySubmission(scheme.id, '2026', 'Q1', {
      wasteData: { portable: '0.5', industrial: '0.25', automotive: '0.125' }
    })
    buildDom(
      {
        view: 'quarterly',
        step: 'waste-data',
        quarter: 'Q1',
        compliancePeriodYear: '2026',
        target: 'hydrate'
      },
      '<form><input name="portable" /><input name="industrial" /><input name="automotive" /></form>'
    )
    runQuarterlyStep(document, globalThis.location)
    expect(document.querySelector('input[name="portable"]').value).toBe('0.5')
  })

  test('declaration hydrate marks the checkbox when status=submitted', () => {
    const [scheme] = storage.listSchemes()
    storage.upsertQuarterlySubmission(scheme.id, '2026', 'Q1', {
      status: 'submitted'
    })
    buildDom(
      {
        view: 'quarterly',
        step: 'declaration',
        quarter: 'Q1',
        compliancePeriodYear: '2026',
        target: 'hydrate'
      },
      '<form><input type="checkbox" name="declarationAccepted" value="yes" /></form>'
    )
    runQuarterlyStep(document, globalThis.location)
    expect(
      document.querySelector('input[name="declarationAccepted"]').checked
    ).toBe(true)
  })

  test('check-answers populates the summary cells from the submission', () => {
    const [scheme] = storage.listSchemes()
    storage.upsertQuarterlySubmission(scheme.id, '2026', 'Q1', {
      marketData: { portable: '1', industrial: '2', automotive: '3' },
      wasteData: { portable: '0.1', industrial: '0.2', automotive: '0.3' }
    })
    buildCheckDom({
      view: 'quarterly',
      step: 'check-answers',
      quarter: 'Q1',
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })
    expect(runQuarterlyStep(document, globalThis.location)).toBe('hydrated')
    expect(
      document.querySelector('[data-testid="quarterly-check-market-portable"]')
        .textContent
    ).toBe('1')
    expect(
      document.querySelector('[data-testid="quarterly-check-waste-automotive"]')
        .textContent
    ).toBe('0.3')
  })

  test('check-answers shows em-dash placeholders when no submission yet', () => {
    buildCheckDom({
      view: 'quarterly',
      step: 'check-answers',
      quarter: 'Q1',
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })
    runQuarterlyStep(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="quarterly-check-market-portable"]')
        .textContent
    ).toBe('—')
  })

  test('confirmation step needs no form or summary', () => {
    buildDom({
      view: 'quarterly',
      step: 'confirmation',
      quarter: 'Q1',
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })
    expect(runQuarterlyStep(document, globalThis.location)).toBe('hydrated')
  })

  test('hydrate is a no-op when the form is missing', () => {
    buildDom({
      view: 'quarterly',
      step: 'market-data',
      quarter: 'Q1',
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })
    expect(runQuarterlyStep(document, globalThis.location)).toBe('hydrated')
  })

  test('declaration hydrate leaves checkbox unchecked when status is not submitted', () => {
    buildDom(
      {
        view: 'quarterly',
        step: 'declaration',
        quarter: 'Q1',
        compliancePeriodYear: '2026',
        target: 'hydrate'
      },
      '<form><input type="checkbox" name="declarationAccepted" value="yes" /></form>'
    )
    runQuarterlyStep(document, globalThis.location)
    expect(
      document.querySelector('input[name="declarationAccepted"]').checked
    ).toBe(false)
  })
})
