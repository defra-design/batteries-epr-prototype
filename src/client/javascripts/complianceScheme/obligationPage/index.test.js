// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runObligationPage } from './index.js'
import { storage, createEvidence } from '../../storage-adapter.js'

const PAYLOAD = {
  view: 'obligation',
  compliancePeriodYear: '2026',
  copy: {
    categories: {
      portable: 'Portable',
      industrial: 'Industrial',
      automotive: 'Automotive'
    }
  }
}

const buildDom = (payload = PAYLOAD) => {
  document.body.innerHTML = `
    <table><tbody data-testid="obligation-body"></tbody></table>
    <dd data-testid="obligation-total-placed"></dd>
    <dd data-testid="obligation-total-obligation"></dd>
    <dd data-testid="obligation-total-accepted"></dd>
    <dd data-testid="obligation-total-outstanding"></dd>
    <span data-testid="obligation-calc-portable-collection-placed"></span>
    <span data-testid="obligation-calc-portable-collection-placed"></span>
    <span data-testid="obligation-calc-portable-collection-target"></span>
    <span data-testid="obligation-calc-portable-collection-obligation"></span>
    <span data-testid="obligation-calc-portable-recycling-target"></span>
    <span data-testid="obligation-calc-portable-recycling-obligation"></span>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

beforeEach(() => {
  globalThis.localStorage.clear()
  storage.seedDemoData()
  storage.setCurrentSchemeId(storage.listSchemes()[0].id)
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('runObligationPage', () => {
  test('renders three rows of zeros when no quarterly or evidence data exists', () => {
    buildDom()
    expect(runObligationPage(document)).toBe('rendered')
    expect(
      document.querySelectorAll('tr[data-testid^="obligation-row-"]')
    ).toHaveLength(3)
    expect(
      document.querySelector('[data-testid="obligation-total-placed"]')
        .textContent
    ).toBe('0.000')
  })

  test('escapes special characters in category labels', () => {
    const [scheme] = storage.listSchemes()
    storage.saveRegulatorCategories(scheme.agencyCode, [
      { id: 'portable', label: 'Portable & co', shortLabel: 'Portable' },
      { id: 'industrial', label: 'Industrial', shortLabel: 'Industrial' },
      { id: 'automotive', label: 'Automotive', shortLabel: 'Automotive' }
    ])
    storage.saveQuarterlySubmission({
      schemeId: scheme.id,
      compliancePeriodYear: '2026',
      quarter: 'Q1',
      status: 'submitted',
      memberData: [
        {
          memberId: 'm-1',
          marketData: { portable: '1', industrial: '0', automotive: '0' }
        }
      ]
    })
    buildDom({
      ...PAYLOAD,
      copy: {
        categories: {
          portable: 'Portable & co',
          industrial: 'Industrial',
          automotive: 'Automotive'
        }
      }
    })
    runObligationPage(document)
    expect(
      document.querySelector('[data-testid="obligation-row-portable"]')
        .innerHTML
    ).toContain('Portable &amp; co')
  })

  test('reflects quarterly market data and accepted evidence', () => {
    const [scheme] = storage.listSchemes()
    storage.saveQuarterlySubmission({
      schemeId: scheme.id,
      compliancePeriodYear: '2026',
      quarter: 'Q1',
      status: 'submitted',
      memberData: [
        {
          memberId: 'm-1',
          marketData: { portable: '100', industrial: '50', automotive: '50' }
        }
      ]
    })
    storage.saveEvidence(
      createEvidence({
        schemeId: scheme.id,
        compliancePeriodYear: '2026',
        category: 'portable',
        tonnes: '10',
        status: 'accepted'
      })
    )
    buildDom()
    runObligationPage(document)
    expect(
      document.querySelector('[data-testid="obligation-row-portable-placed"]')
        .textContent
    ).toBe('100.000')
    expect(
      document.querySelector(
        '[data-testid="obligation-row-portable-obligation"]'
      ).textContent
    ).toBe('45.000')
    expect(
      document.querySelector('[data-testid="obligation-row-portable-accepted"]')
        .textContent
    ).toBe('10.000')
    expect(
      document.querySelector(
        '[data-testid="obligation-row-portable-outstanding"]'
      ).textContent
    ).toBe('35.000')
    expect(
      document.querySelector('[data-testid="obligation-total-obligation"]')
        .textContent
    ).toBe('95.000')
  })

  test('populates the collection and recycling formula figures', () => {
    const [scheme] = storage.listSchemes()
    storage.saveQuarterlySubmission({
      schemeId: scheme.id,
      compliancePeriodYear: '2026',
      quarter: 'Q1',
      status: 'submitted',
      memberData: [
        {
          memberId: 'm-1',
          marketData: { portable: '100', industrial: '0', automotive: '0' }
        }
      ]
    })
    buildDom()
    runObligationPage(document)

    const placedSpans = document.querySelectorAll(
      '[data-testid="obligation-calc-portable-collection-placed"]'
    )
    expect(placedSpans).toHaveLength(2)
    for (const span of placedSpans) {
      expect(span.textContent).toBe('100.000')
    }
    expect(
      document.querySelector(
        '[data-testid="obligation-calc-portable-collection-target"]'
      ).textContent
    ).toBe('45')
    expect(
      document.querySelector(
        '[data-testid="obligation-calc-portable-collection-obligation"]'
      ).textContent
    ).toBe('45.000')
    expect(
      document.querySelector(
        '[data-testid="obligation-calc-portable-recycling-target"]'
      ).textContent
    ).toBe('45')
    expect(
      document.querySelector(
        '[data-testid="obligation-calc-portable-recycling-obligation"]'
      ).textContent
    ).toBe('45.000')
  })

  test('scopes data to the active compliance period', () => {
    const [scheme] = storage.listSchemes()
    storage.saveQuarterlySubmission({
      schemeId: scheme.id,
      compliancePeriodYear: '2026',
      quarter: 'Q1',
      status: 'submitted',
      memberData: [
        {
          memberId: 'm-1',
          marketData: { portable: '100', industrial: '0', automotive: '0' }
        }
      ]
    })
    storage.saveQuarterlySubmission({
      schemeId: scheme.id,
      compliancePeriodYear: '2027',
      quarter: 'Q1',
      status: 'submitted',
      memberData: [
        {
          memberId: 'm-1',
          marketData: { portable: '500', industrial: '0', automotive: '0' }
        }
      ]
    })
    buildDom({ ...PAYLOAD, compliancePeriodYear: '2027' })
    runObligationPage(document)
    expect(
      document.querySelector('[data-testid="obligation-row-portable-placed"]')
        .textContent
    ).toBe('500.000')
  })

  test('redirects to the sign-in picker when no current scheme is selected', () => {
    storage.clearCurrentSchemeId()
    const assign = vi.fn()
    buildDom()
    expect(runObligationPage(document, { assign })).toBe(
      'redirected-to-sign-in'
    )
    expect(assign).toHaveBeenCalledWith('/compliance-scheme/sign-in')
  })
})
