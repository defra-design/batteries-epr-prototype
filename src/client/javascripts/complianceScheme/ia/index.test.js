// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runIaStep } from './index.js'
import { storage } from '../../storage-adapter.js'

const buildDom = (payload, formHtml = '') => {
  document.body.innerHTML = `
    ${formHtml}
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

const buildCheckDom = (payload) => {
  document.body.innerHTML = `
    <dd data-testid="ia-check-placed-industrial"></dd>
    <dd data-testid="ia-check-placed-automotive"></dd>
    <dd data-testid="ia-check-exported-industrial"></dd>
    <dd data-testid="ia-check-exported-automotive"></dd>
    <dd data-testid="ia-check-taken-back-industrial"></dd>
    <dd data-testid="ia-check-taken-back-automotive"></dd>
    <dd data-testid="ia-check-delivered-industrial"></dd>
    <dd data-testid="ia-check-delivered-automotive"></dd>
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

describe('runIaStep persist', () => {
  test('upserts on (schemeId, year) and navigates', () => {
    buildDom({
      view: 'ia',
      step: 'placed',
      compliancePeriodYear: '2026',
      target: 'persist',
      patch: { placed: { industrial: '10', automotive: '5' } },
      next: '/compliance-scheme/industrial-automotive/exported'
    })

    expect(runIaStep(document, globalThis.location)).toBe('navigated')
    const [scheme] = storage.listSchemes()
    const submission = storage.findIaSubmission(scheme.id, '2026')
    expect(submission.placed).toEqual({ industrial: '10', automotive: '5' })
    expect(assignSpy).toHaveBeenCalledWith(
      '/compliance-scheme/industrial-automotive/exported'
    )
  })

  test('persists without next returns persisted', () => {
    buildDom({
      view: 'ia',
      step: 'declaration',
      compliancePeriodYear: '2026',
      target: 'persist',
      patch: { status: 'submitted' },
      next: null
    })
    expect(runIaStep(document, globalThis.location)).toBe('persisted')
    expect(assignSpy).not.toHaveBeenCalled()
  })

  test('isolates submissions by year', () => {
    const [scheme] = storage.listSchemes()
    buildDom({
      view: 'ia',
      step: 'placed',
      compliancePeriodYear: '2026',
      target: 'persist',
      patch: { placed: { industrial: '1', automotive: '0' } },
      next: null
    })
    runIaStep(document, globalThis.location)
    buildDom({
      view: 'ia',
      step: 'placed',
      compliancePeriodYear: '2027',
      target: 'persist',
      patch: { placed: { industrial: '9', automotive: '0' } },
      next: null
    })
    runIaStep(document, globalThis.location)
    expect(storage.findIaSubmission(scheme.id, '2026').placed.industrial).toBe('1')
    expect(storage.findIaSubmission(scheme.id, '2027').placed.industrial).toBe('9')
  })
})

describe('runIaStep hydrate', () => {
  test.each([
    ['placed', 'placed'],
    ['exported', 'exported'],
    ['taken-back', 'takenBack'],
    ['delivered', 'delivered']
  ])('%s hydrates from existing submission', (step, key) => {
    const [scheme] = storage.listSchemes()
    storage.upsertIaSubmission(scheme.id, '2026', {
      [key]: { industrial: '7', automotive: '8' }
    })
    buildDom(
      {
        view: 'ia',
        step,
        compliancePeriodYear: '2026',
        target: 'hydrate'
      },
      '<form><input name="industrial" /><input name="automotive" /></form>'
    )
    runIaStep(document, globalThis.location)
    expect(document.querySelector('input[name="industrial"]').value).toBe('7')
    expect(document.querySelector('input[name="automotive"]').value).toBe('8')
  })

  test('declaration hydrate marks the checkbox when status=submitted', () => {
    const [scheme] = storage.listSchemes()
    storage.upsertIaSubmission(scheme.id, '2026', { status: 'submitted' })
    buildDom(
      {
        view: 'ia',
        step: 'declaration',
        compliancePeriodYear: '2026',
        target: 'hydrate'
      },
      '<form><input type="checkbox" name="declarationAccepted" value="yes" /></form>'
    )
    runIaStep(document, globalThis.location)
    expect(
      document.querySelector('input[name="declarationAccepted"]').checked
    ).toBe(true)
  })

  test('declaration hydrate leaves checkbox unchecked when status not submitted', () => {
    buildDom(
      {
        view: 'ia',
        step: 'declaration',
        compliancePeriodYear: '2026',
        target: 'hydrate'
      },
      '<form><input type="checkbox" name="declarationAccepted" value="yes" /></form>'
    )
    runIaStep(document, globalThis.location)
    expect(
      document.querySelector('input[name="declarationAccepted"]').checked
    ).toBe(false)
  })

  test('check-answers populates all four section pairs', () => {
    const [scheme] = storage.listSchemes()
    storage.upsertIaSubmission(scheme.id, '2026', {
      placed: { industrial: '10', automotive: '5' },
      exported: { industrial: '1', automotive: '0.5' },
      takenBack: { industrial: '2', automotive: '1' },
      delivered: { industrial: '3', automotive: '2' }
    })
    buildCheckDom({
      view: 'ia',
      step: 'check-answers',
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })
    runIaStep(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="ia-check-placed-industrial"]')
        .textContent
    ).toBe('10')
    expect(
      document.querySelector('[data-testid="ia-check-delivered-automotive"]')
        .textContent
    ).toBe('2')
  })

  test('check-answers shows em-dash placeholders when no submission yet', () => {
    buildCheckDom({
      view: 'ia',
      step: 'check-answers',
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })
    runIaStep(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="ia-check-placed-industrial"]')
        .textContent
    ).toBe('—')
  })

  test('confirmation step needs no form or summary', () => {
    buildDom({
      view: 'ia',
      step: 'confirmation',
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })
    expect(runIaStep(document, globalThis.location)).toBe('hydrated')
  })

  test('hydrate is a no-op when the form is missing', () => {
    buildDom({
      view: 'ia',
      step: 'placed',
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })
    expect(runIaStep(document, globalThis.location)).toBe('hydrated')
  })
})
