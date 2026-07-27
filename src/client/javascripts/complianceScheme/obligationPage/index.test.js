// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runObligationPage } from './index.js'
import { storage, createEvidence } from '../../storage-adapter.js'

const FORMULA_COPY = {
  formulaEquation: 'X × Y = Z',
  formula: {
    collectionHeading: 'Collection obligation',
    recyclingHeading: 'Recycling obligation',
    placedTerm: 'the total tonnes placed on the UK market',
    collectionTargetTerm: 'the collection target',
    recyclingTargetTerm: 'the recycling target',
    collectionResultLabel: 'Your collection obligation is:',
    recyclingResultLabel: 'Your recycling obligation is:',
    tonnesUnit: 'tonnes'
  }
}

const PAYLOAD = {
  view: 'obligation',
  compliancePeriodYear: '2026',
  urls: { quarterly: '/compliance-scheme/quarterly/{quarter}/{step}' },
  copy: {
    incompleteQuartersConfirm: 'Not all quarters done. Calculate anyway?',
    configChanged: {
      title: 'Battery categories have changed',
      intro: 'Categories changed since you submitted.',
      resubmitAction: 'Resubmit your {quarter} return'
    },
    categories: {
      portable: 'Portable',
      industrial: 'Industrial',
      automotive: 'Automotive'
    },
    ...FORMULA_COPY
  }
}

const RESULTS = `
  <div data-testid="obligation-results" hidden>
    <table><tbody data-testid="obligation-body"></tbody></table>
    <dd data-testid="obligation-total-placed"></dd>
    <dd data-testid="obligation-total-obligation"></dd>
    <dd data-testid="obligation-total-accepted"></dd>
    <dd data-testid="obligation-total-outstanding"></dd>
    <dd data-testid="obligation-certificate-calculated-at"></dd>
    <dd data-testid="obligation-certificate-rule-version"></dd>
    <dd data-testid="obligation-certificate-config"></dd>
    <ul data-testid="obligation-certificate-targets"></ul>
    <div data-testid="obligation-calc-list"></div>
  </div>`

const buildDom = (payload = PAYLOAD) => {
  document.body.innerHTML = `
    <div data-testid="obligation-config-changed" hidden>
      <ul data-testid="obligation-config-changed-list"></ul>
    </div>
    <button data-testid="obligation-calculate" type="button">Calculate obligation</button>
    <p data-testid="obligation-empty" hidden></p>
    ${RESULTS}
    <details data-testid="obligation-previous" hidden>
      <table><tbody data-testid="obligation-previous-list"></tbody></table>
    </details>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

const clickCalculate = (doc = document) =>
  doc.querySelector('[data-testid="obligation-calculate"]').click()

beforeEach(() => {
  globalThis.localStorage.clear()
  storage.seedDemoData()
  storage.setCurrentSchemeId(storage.listSchemes()[0].id)
  vi.spyOn(globalThis, 'confirm').mockReturnValue(true)
})

afterEach(() => {
  vi.restoreAllMocks()
  globalThis.localStorage.clear()
})

describe('runObligationPage', () => {
  test('shows the empty state and saves nothing until calculated', () => {
    const [scheme] = storage.listSchemes()
    buildDom()

    expect(runObligationPage(document)).toBe('awaiting-calculation')
    expect(
      document.querySelector('[data-testid="obligation-empty"]').hidden
    ).toBe(false)
    expect(
      document.querySelector('[data-testid="obligation-results"]').hidden
    ).toBe(true)
    expect(
      document.querySelector('[data-testid="obligation-previous"]').hidden
    ).toBe(true)
    expect(
      document.querySelector('[data-testid="obligation-calculate"]').hidden
    ).toBe(false)
    expect(storage.getObligationSnapshot(scheme.id, '2026')).toBeNull()
  })

  test('calculating on click saves a snapshot, reveals results and hides the button', () => {
    const [scheme] = storage.listSchemes()
    buildDom()

    runObligationPage(document)
    clickCalculate()

    expect(
      document.querySelector('[data-testid="obligation-results"]').hidden
    ).toBe(false)
    expect(
      document.querySelector('[data-testid="obligation-calculate"]').hidden
    ).toBe(true)
    expect(
      document.querySelectorAll('tr[data-testid^="obligation-row-"]')
    ).toHaveLength(3)
    expect(
      storage.listObligationSnapshots({ schemeId: scheme.id })
    ).toHaveLength(1)
  })

  test('renders directly from an existing snapshot without the empty state', () => {
    buildDom()
    runObligationPage(document)
    clickCalculate()

    buildDom()
    expect(runObligationPage(document)).toBe('rendered')
    expect(
      document.querySelector('[data-testid="obligation-results"]').hidden
    ).toBe(false)
    expect(
      document.querySelector('[data-testid="obligation-calculate"]').hidden
    ).toBe(true)
  })

  test('calculates only once per compliance period', () => {
    const [scheme] = storage.listSchemes()
    buildDom()
    runObligationPage(document)
    clickCalculate()
    // A second attempt is a no-op even if the (hidden) button is clicked.
    clickCalculate()

    expect(
      storage.listObligationSnapshots({ schemeId: scheme.id })
    ).toHaveLength(1)
  })

  test('lists prior years under previously calculated obligations', () => {
    const [scheme] = storage.listSchemes()
    buildDom()
    runObligationPage(document)
    clickCalculate()

    buildDom({ ...PAYLOAD, compliancePeriodYear: '2027' })
    runObligationPage(document)
    clickCalculate()

    expect(
      document.querySelector('[data-testid="obligation-previous"]').hidden
    ).toBe(false)
    expect(
      document.querySelectorAll('[data-testid="obligation-previous-item"]')
    ).toHaveLength(1)
    expect(
      storage.listObligationSnapshots({ schemeId: scheme.id })
    ).toHaveLength(2)
  })

  test('warns and aborts when quarters are incomplete and the warning is declined', () => {
    globalThis.confirm.mockReturnValue(false)
    const [scheme] = storage.listSchemes()
    buildDom()
    runObligationPage(document)
    clickCalculate()

    expect(globalThis.confirm).toHaveBeenCalledWith(
      PAYLOAD.copy.incompleteQuartersConfirm
    )
    expect(
      storage.listObligationSnapshots({ schemeId: scheme.id })
    ).toHaveLength(0)
    expect(
      document.querySelector('[data-testid="obligation-empty"]').hidden
    ).toBe(false)
  })

  test('skips the warning when all four quarters are submitted', () => {
    const [scheme] = storage.listSchemes()
    for (const quarter of ['Q1', 'Q2', 'Q3', 'Q4']) {
      storage.saveQuarterlySubmission({
        schemeId: scheme.id,
        compliancePeriodYear: '2026',
        quarter,
        status: 'submitted',
        memberData: []
      })
    }
    buildDom()
    runObligationPage(document)
    clickCalculate()

    expect(globalThis.confirm).not.toHaveBeenCalled()
    expect(
      storage.listObligationSnapshots({ schemeId: scheme.id })
    ).toHaveLength(1)
  })

  test('renders three rows of zeros when no quarterly or evidence data exists', () => {
    buildDom()
    runObligationPage(document)
    clickCalculate()
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
        ...PAYLOAD.copy,
        categories: {
          portable: 'Portable & co',
          industrial: 'Industrial',
          automotive: 'Automotive'
        }
      }
    })
    runObligationPage(document)
    clickCalculate()
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
    clickCalculate()
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

  test('shows certificate metadata from the saved snapshot', () => {
    buildDom()
    runObligationPage(document)
    clickCalculate()

    expect(
      document.querySelector(
        '[data-testid="obligation-certificate-rule-version"]'
      ).textContent
    ).toBe('GB-playground-v1')
    expect(
      document.querySelector('[data-testid="obligation-certificate-config"]')
        .textContent
    ).toContain('regulatorTargets')
    expect(
      document.querySelector('[data-testid="obligation-certificate-targets"]')
        .textContent
    ).toContain('Portable batteries: collection 45%, recycling 45%')
  })

  test('renders when certificate nodes are not present', () => {
    document.body.innerHTML = `
      <button data-testid="obligation-calculate" type="button">Calculate</button>
      <p data-testid="obligation-empty" hidden></p>
      <div data-testid="obligation-results" hidden>
        <table><tbody data-testid="obligation-body"></tbody></table>
        <dd data-testid="obligation-total-placed"></dd>
        <dd data-testid="obligation-total-obligation"></dd>
        <dd data-testid="obligation-total-accepted"></dd>
        <dd data-testid="obligation-total-outstanding"></dd>
      </div>
      <script id="page-payload" type="application/json">${JSON.stringify(PAYLOAD)}</script>
    `

    runObligationPage(document)
    clickCalculate()
    expect(
      document.querySelectorAll('tr[data-testid^="obligation-row-"]')
    ).toHaveLength(3)
  })

  test('calculates even when the empty/results wrappers are absent', () => {
    document.body.innerHTML = `
      <button data-testid="obligation-calculate" type="button">Calculate</button>
      <table><tbody data-testid="obligation-body"></tbody></table>
      <dd data-testid="obligation-total-placed"></dd>
      <dd data-testid="obligation-total-obligation"></dd>
      <dd data-testid="obligation-total-accepted"></dd>
      <dd data-testid="obligation-total-outstanding"></dd>
      <script id="page-payload" type="application/json">${JSON.stringify(PAYLOAD)}</script>
    `

    expect(runObligationPage(document)).toBe('awaiting-calculation')
    clickCalculate()
    expect(
      document.querySelectorAll('tr[data-testid^="obligation-row-"]')
    ).toHaveLength(3)
  })

  test('stays in the empty state when the calculate button is absent', () => {
    document.body.innerHTML = `
      <p data-testid="obligation-empty" hidden></p>
      <div data-testid="obligation-results" hidden></div>
      <script id="page-payload" type="application/json">${JSON.stringify(PAYLOAD)}</script>
    `

    expect(runObligationPage(document)).toBe('awaiting-calculation')
    expect(
      document.querySelector('[data-testid="obligation-empty"]').hidden
    ).toBe(false)
  })

  test('renders from the saved snapshot after live targets change', () => {
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
    storage.saveRegulatorTargets('EA', {
      collection: { portable: 45, industrial: 100, automotive: 100 },
      recycling: { portable: 60, industrial: 50, automotive: 50 }
    })

    buildDom()
    runObligationPage(document)
    clickCalculate()
    expect(
      document.querySelector(
        '[data-testid="obligation-row-portable-obligation"]'
      ).textContent
    ).toBe('60.000')

    storage.saveRegulatorTargets('EA', {
      collection: { portable: 45, industrial: 100, automotive: 100 },
      recycling: { portable: 10, industrial: 50, automotive: 50 }
    })

    buildDom()
    expect(runObligationPage(document)).toBe('rendered')
    expect(
      document.querySelector(
        '[data-testid="obligation-row-portable-obligation"]'
      ).textContent
    ).toBe('60.000')
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
    clickCalculate()

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
    clickCalculate()
    expect(
      document.querySelector('[data-testid="obligation-row-portable-placed"]')
        .textContent
    ).toBe('500.000')
  })

  test('renders a regulator-added category in the table, certificate and calc details', () => {
    const [scheme] = storage.listSchemes()
    storage.saveRegulatorCategories(scheme.agencyCode, [
      { id: 'portable', label: 'Portable batteries', shortLabel: 'Portable' },
      {
        id: 'industrial',
        label: 'Industrial batteries',
        shortLabel: 'Industrial'
      },
      {
        id: 'automotive',
        label: 'Automotive batteries',
        shortLabel: 'Automotive'
      },
      { id: 'lmt', label: 'Light means of transport', shortLabel: 'LMT' }
    ])
    buildDom()
    runObligationPage(document)
    clickCalculate()

    expect(
      document.querySelector('[data-testid="obligation-row-lmt"]').innerHTML
    ).toContain('Light means of transport')
    expect(
      document.querySelector('[data-testid="obligation-certificate-targets"]')
        .textContent
    ).toContain('Light means of transport: collection 0%, recycling 0%')
    expect(
      document.querySelector('[data-testid="obligation-calc-lmt"]')
    ).not.toBeNull()
  })

  test('falls back to content labels when a snapshot has no categoryLabels', () => {
    const [scheme] = storage.listSchemes()
    storage.saveObligationSnapshot({
      schemeId: scheme.id,
      schemeName: scheme.name,
      agencyCode: scheme.agencyCode,
      compliancePeriodYear: '2026',
      calculatedAt: '2026-05-01T00:00:00.000Z',
      batteryCategories: ['portable', 'lmt'],
      targets: {
        collection: { portable: 45, lmt: 0 },
        recycling: { portable: 45, lmt: 0 }
      },
      rules: {
        version: 'GB-playground-v1',
        configSource: 'regulatorTargets',
        configVersion: 'default'
      },
      rows: [
        {
          category: 'portable',
          placed: 0,
          targetPercent: 45,
          collectionTargetPercent: 45,
          obligation: 0,
          collectionObligation: 0,
          accepted: 0,
          outstanding: 0
        },
        {
          category: 'lmt',
          placed: 0,
          targetPercent: 0,
          collectionTargetPercent: 0,
          obligation: 0,
          collectionObligation: 0,
          accepted: 0,
          outstanding: 0
        }
      ],
      totals: { placed: 0, obligation: 0, accepted: 0, outstanding: 0 }
    })
    buildDom()

    expect(runObligationPage(document)).toBe('rendered')
    expect(
      document.querySelector('[data-testid="obligation-row-portable"]')
        .innerHTML
    ).toContain('Portable')
    expect(
      document.querySelector('[data-testid="obligation-certificate-targets"]')
        .textContent
    ).toContain('Portable: collection 45%, recycling 45%')
    expect(
      document.querySelector('[data-testid="obligation-row-lmt"]').innerHTML
    ).toContain('lmt')
  })

  const baseCategories = () => [
    { id: 'portable', label: 'Portable batteries', shortLabel: 'Portable' },
    {
      id: 'industrial',
      label: 'Industrial batteries',
      shortLabel: 'Industrial'
    },
    {
      id: 'automotive',
      label: 'Automotive batteries',
      shortLabel: 'Automotive'
    }
  ]

  const submitQuarter = (scheme, extra = {}) =>
    storage.saveQuarterlySubmission({
      schemeId: scheme.id,
      compliancePeriodYear: '2026',
      quarter: 'Q1',
      status: 'submitted',
      memberData: [],
      ...extra
    })

  const banner = () =>
    document.querySelector('[data-testid="obligation-config-changed"]')

  test('blocks calculation and prompts to resubmit when a category is added after a return was submitted', () => {
    const [scheme] = storage.listSchemes()
    submitQuarter(scheme, {
      categoryIds: ['portable', 'industrial', 'automotive']
    })
    storage.saveRegulatorCategories(scheme.agencyCode, [
      ...baseCategories(),
      { id: 'lmt', label: 'LMT batteries', shortLabel: 'LMT' }
    ])
    buildDom()

    runObligationPage(document)

    expect(banner().hidden).toBe(false)
    const link = document.querySelector(
      '[data-testid="obligation-config-changed-Q1"]'
    )
    expect(link.getAttribute('href')).toBe(
      '/compliance-scheme/quarterly/Q1/member-list'
    )
    expect(link.textContent).toBe('Resubmit your Q1 return')

    clickCalculate()
    expect(
      storage.listObligationSnapshots({ schemeId: scheme.id })
    ).toHaveLength(0)
    expect(banner().hidden).toBe(false)
  })

  test('blocks calculation when a category is removed after a return was submitted', () => {
    const [scheme] = storage.listSchemes()
    submitQuarter(scheme, {
      categoryIds: ['portable', 'industrial', 'automotive']
    })
    storage.saveRegulatorCategories(scheme.agencyCode, [
      { id: 'portable', label: 'Portable batteries', shortLabel: 'Portable' },
      {
        id: 'industrial',
        label: 'Industrial batteries',
        shortLabel: 'Industrial'
      }
    ])
    buildDom()

    runObligationPage(document)
    expect(banner().hidden).toBe(false)

    clickCalculate()
    expect(
      storage.listObligationSnapshots({ schemeId: scheme.id })
    ).toHaveLength(0)
  })

  test('allows calculation when the submitted categories still match', () => {
    const [scheme] = storage.listSchemes()
    submitQuarter(scheme, {
      categoryIds: ['portable', 'industrial', 'automotive']
    })
    buildDom()

    runObligationPage(document)
    expect(banner().hidden).toBe(true)

    clickCalculate()
    expect(
      storage.listObligationSnapshots({ schemeId: scheme.id })
    ).toHaveLength(1)
  })

  test('infers the submitted categories from member data for legacy returns', () => {
    const [scheme] = storage.listSchemes()
    submitQuarter(scheme, {
      memberData: [
        {
          memberId: 'm-1',
          marketData: { portable: '1', industrial: '0', automotive: '0' },
          wasteData: { portable: '0', industrial: '0', automotive: '0' }
        },
        { memberId: 'm-2', marketData: null, wasteData: null }
      ]
    })
    storage.saveRegulatorCategories(scheme.agencyCode, [
      ...baseCategories(),
      { id: 'lmt', label: 'LMT batteries', shortLabel: 'LMT' }
    ])
    buildDom()

    runObligationPage(document)
    expect(banner().hidden).toBe(false)
  })

  test('does not prompt when the submitted category set cannot be determined', () => {
    const [scheme] = storage.listSchemes()
    storage.saveQuarterlySubmission({
      schemeId: scheme.id,
      compliancePeriodYear: '2026',
      quarter: 'Q1',
      status: 'submitted'
    })
    storage.saveRegulatorCategories(scheme.agencyCode, [
      ...baseCategories(),
      { id: 'lmt', label: 'LMT batteries', shortLabel: 'LMT' }
    ])
    buildDom()

    runObligationPage(document)
    expect(banner().hidden).toBe(true)
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
