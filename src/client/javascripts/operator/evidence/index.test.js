// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import {
  runOperatorEvidencePage,
  __testing__
} from './index.js'
import { storage, createOperator, createEvidence, STORAGE_KEYS } from '../../storage-adapter.js'

const { ISSUE_DRAFT_KEY, writeDraft, clearDraft } = __testing__

const installPayload = (payload) => {
  const existing = document.querySelector('#page-payload')
  if (existing) existing.remove()
  const el = document.createElement('script')
  el.id = 'page-payload'
  el.type = 'application/json'
  el.textContent = JSON.stringify(payload)
  document.body.appendChild(el)
}

let assignSpy

const seedOperator = (overrides = {}) => {
  const op = createOperator({
    id: '33333333-0001-4000-a000-000000000001',
    name: 'Green & Recycling Ltd',
    approvalType: 'abto',
    approvalNumber: 'ABTO-EA-2026-000001',
    approvalStatus: 'approved',
    batteryTypes: { isPortable: true, isIndustrial: true, isAutomotive: false },
    sites: [{ name: 'Main Site' }],
    ...overrides
  })
  storage.saveOperator(op)
  storage.setCurrentOperatorId(op.id)
  return op
}

const LIST_HTML = `
  <table><tbody data-testid="evidence-body"></tbody></table>
  <p data-testid="evidence-empty" hidden></p>
`

const SCHEME_HTML = `
  <form data-testid="evidence-issue-form">
    <div data-testid="evidence-issue-scheme-radios"></div>
    <p data-testid="evidence-issue-no-schemes" hidden></p>
  </form>
`

const TONNAGE_HTML = `
  <form data-testid="evidence-issue-form">
    <input type="radio" name="category" value="portable" />
    <input type="radio" name="category" value="industrial" />
    <input name="tonnes" />
    <input name="wasteReceivedFrom" />
    <input name="wasteReceivedTo" />
  </form>
`

const DECLARATION_HTML = `
  <dd data-testid="evidence-issue-summary-scheme"></dd>
  <dd data-testid="evidence-issue-summary-category"></dd>
  <dd data-testid="evidence-issue-summary-tonnes"></dd>
  <dd data-testid="evidence-issue-summary-dates"></dd>
`

const DETAIL_HTML = `
  <p data-testid="evidence-detail-not-found" hidden></p>
  <dl data-testid="evidence-detail-list" hidden>
    <dd data-testid="evidence-detail-scheme"></dd>
    <dd data-testid="evidence-detail-category"></dd>
    <dd data-testid="evidence-detail-tonnes"></dd>
    <dd data-testid="evidence-detail-status"></dd>
    <dd data-testid="evidence-detail-issued"></dd>
    <dd data-testid="evidence-detail-dates"></dd>
  </dl>
`

beforeEach(() => {
  globalThis.localStorage.clear()
  assignSpy = vi.fn()
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('runOperatorEvidencePage', () => {
  test('redirects to sign-in when no operator selected', () => {
    document.body.innerHTML = LIST_HTML
    installPayload({ view: 'list', compliancePeriodYear: '2026' })
    expect(runOperatorEvidencePage(document, { assign: assignSpy })).toBe(
      'redirected-to-sign-in'
    )
    expect(assignSpy).toHaveBeenCalledWith('/operator/sign-in')
  })

  describe('list view', () => {
    test('shows empty message when no evidence', () => {
      seedOperator()
      document.body.innerHTML = LIST_HTML
      installPayload({
        view: 'list',
        compliancePeriodYear: '2026',
        copy: {
          categories: { portable: 'Portable' },
          statuses: { 'awaiting-acceptance': 'Awaiting' },
          viewAction: 'View'
        },
        urls: { detailTemplate: '/operator/evidence/{evidenceId}' }
      })
      expect(runOperatorEvidencePage(document, { assign: assignSpy })).toBe(
        'list'
      )
      expect(
        document.querySelector('[data-testid="evidence-empty"]').hidden
      ).toBe(false)
    })

    test('renders evidence rows when evidence exists', () => {
      const op = seedOperator()
      storage.seedDemoData()
      storage.saveEvidence(
        createEvidence({
          schemeId: storage.listSchemes()[0].id,
          compliancePeriodYear: '2026',
          category: 'portable',
          tonnes: '1.500',
          issuedByOperatorId: op.id,
          direction: 'operator-to-scheme'
        })
      )
      document.body.innerHTML = LIST_HTML
      installPayload({
        view: 'list',
        compliancePeriodYear: '2026',
        copy: {
          categories: { portable: 'Portable' },
          statuses: { 'awaiting-acceptance': 'Awaiting' },
          viewAction: 'View'
        },
        urls: { detailTemplate: '/operator/evidence/{evidenceId}' }
      })
      runOperatorEvidencePage(document, { assign: assignSpy })
      expect(
        document.querySelector('[data-testid="evidence-empty"]').hidden
      ).toBe(true)
      expect(
        document.querySelectorAll('[data-testid="evidence-row"]').length
      ).toBe(1)
    })
  })

  describe('issue view - scheme step', () => {
    test('renders scheme radios from approved schemes', () => {
      seedOperator()
      storage.seedDemoData()
      document.body.innerHTML = SCHEME_HTML
      installPayload({
        view: 'issue',
        step: 'scheme',
        target: 'hydrate',
        compliancePeriodYear: '2026'
      })
      runOperatorEvidencePage(document, { assign: assignSpy })
      expect(
        document.querySelectorAll(
          '[data-testid="evidence-issue-scheme-option"]'
        ).length
      ).toBeGreaterThan(0)
    })

    test('shows no-schemes message when none available', () => {
      seedOperator()
      globalThis.localStorage.setItem(STORAGE_KEYS.seedVersion, '999')
      globalThis.localStorage.removeItem(STORAGE_KEYS.schemes)
      document.body.innerHTML = SCHEME_HTML
      installPayload({
        view: 'issue',
        step: 'scheme',
        target: 'hydrate',
        compliancePeriodYear: '2026'
      })
      runOperatorEvidencePage(document, { assign: assignSpy })
      expect(
        document.querySelector('[data-testid="evidence-issue-no-schemes"]')
          .hidden
      ).toBe(false)
    })
  })

  describe('issue view - tonnage step', () => {
    test('hydrates tonnage form from draft', () => {
      seedOperator()
      writeDraft({
        schemeId: 'some-id',
        category: 'portable',
        tonnes: '2.000',
        wasteReceivedFrom: '2026-01-01',
        wasteReceivedTo: '2026-03-31'
      })
      document.body.innerHTML = TONNAGE_HTML
      installPayload({
        view: 'issue',
        step: 'tonnage',
        target: 'hydrate'
      })
      runOperatorEvidencePage(document, { assign: assignSpy })
      expect(
        document.querySelector('input[name="category"][value="portable"]')
          .checked
      ).toBe(true)
      expect(document.querySelector('input[name="tonnes"]').value).toBe(
        '2.000'
      )
    })
  })

  describe('issue view - declaration step', () => {
    test('renders summary from draft', () => {
      seedOperator()
      storage.seedDemoData()
      const scheme = storage.listSchemes()[0]
      writeDraft({
        schemeId: scheme.id,
        category: 'portable',
        tonnes: '3.000',
        wasteReceivedFrom: '2026-01-01',
        wasteReceivedTo: '2026-03-31'
      })
      document.body.innerHTML = DECLARATION_HTML
      installPayload({
        view: 'issue',
        step: 'declaration',
        target: 'hydrate',
        compliancePeriodYear: '2026'
      })
      runOperatorEvidencePage(document, { assign: assignSpy })
      expect(
        document.querySelector(
          '[data-testid="evidence-issue-summary-scheme"]'
        ).textContent
      ).toBe(scheme.name)
      expect(
        document.querySelector(
          '[data-testid="evidence-issue-summary-tonnes"]'
        ).textContent
      ).toBe('3.000')
    })

    test('renders summary with unknown scheme id when scheme not found', () => {
      seedOperator()
      writeDraft({
        schemeId: 'unknown-id',
        category: 'portable',
        tonnes: '1.000'
      })
      document.body.innerHTML = DECLARATION_HTML
      installPayload({
        view: 'issue',
        step: 'declaration',
        target: 'hydrate',
        compliancePeriodYear: '2026'
      })
      runOperatorEvidencePage(document, { assign: assignSpy })
      expect(
        document.querySelector(
          '[data-testid="evidence-issue-summary-scheme"]'
        ).textContent
      ).toBe('unknown-id')
    })

    test('renders empty summary when draft is empty', () => {
      seedOperator()
      clearDraft()
      document.body.innerHTML = DECLARATION_HTML
      installPayload({
        view: 'issue',
        step: 'declaration',
        target: 'hydrate',
        compliancePeriodYear: '2026'
      })
      runOperatorEvidencePage(document, { assign: assignSpy })
      expect(
        document.querySelector(
          '[data-testid="evidence-issue-summary-scheme"]'
        ).textContent
      ).toBe('')
    })
  })

  describe('issue view - persist', () => {
    test('persists patch to draft and navigates', () => {
      seedOperator()
      document.body.innerHTML = ''
      installPayload({
        view: 'issue',
        step: 'scheme',
        target: 'persist',
        patch: { schemeId: 'abc-123' },
        next: '/operator/evidence/issue/tonnage'
      })
      runOperatorEvidencePage(document, { assign: assignSpy })
      expect(assignSpy).toHaveBeenCalledWith('/operator/evidence/issue/tonnage')
      expect(JSON.parse(localStorage.getItem(ISSUE_DRAFT_KEY)).schemeId).toBe(
        'abc-123'
      )
    })

    test('commit creates evidence and clears draft', () => {
      const op = seedOperator()
      storage.seedDemoData()
      const scheme = storage.listSchemes()[0]
      writeDraft({
        schemeId: scheme.id,
        category: 'portable',
        tonnes: '5.000',
        wasteReceivedFrom: '2026-01-01',
        wasteReceivedTo: '2026-03-31'
      })
      document.body.innerHTML = ''
      installPayload({
        view: 'issue',
        step: 'declaration',
        target: 'persist',
        patch: { commit: true },
        compliancePeriodYear: '2026',
        next: '/operator/evidence/issue/confirmation'
      })
      runOperatorEvidencePage(document, { assign: assignSpy })
      expect(assignSpy).toHaveBeenCalledWith(
        '/operator/evidence/issue/confirmation'
      )
      expect(localStorage.getItem(ISSUE_DRAFT_KEY)).toBeNull()
      const evidence = storage.listEvidenceByOperator(op.id, '2026')
      expect(evidence).toHaveLength(1)
      expect(evidence[0].direction).toBe('operator-to-scheme')
      expect(evidence[0].schemeId).toBe(scheme.id)
      expect(evidence[0].issuedByOperatorId).toBe(op.id)
      expect(evidence[0].issuedByApprovalNumber).toBe('ABTO-EA-2026-000001')
      expect(evidence[0].issuedBySiteName).toBe('Main Site')
      expect(evidence[0].tonnes).toBe('5.000')
    })
  })

  describe('issue view - confirmation', () => {
    test('returns hydrated for confirmation step', () => {
      seedOperator()
      document.body.innerHTML = ''
      installPayload({
        view: 'issue',
        step: 'confirmation',
        target: 'hydrate'
      })
      expect(runOperatorEvidencePage(document, { assign: assignSpy })).toBe(
        'hydrated'
      )
    })
  })

  describe('detail view', () => {
    test('shows evidence detail for operator-issued evidence', () => {
      const op = seedOperator()
      storage.seedDemoData()
      const scheme = storage.listSchemes()[0]
      const evidence = storage.saveEvidence(
        createEvidence({
          schemeId: scheme.id,
          compliancePeriodYear: '2026',
          category: 'portable',
          tonnes: '2.500',
          issuedByOperatorId: op.id,
          wasteReceivedFrom: '2026-01-01',
          wasteReceivedTo: '2026-03-31',
          direction: 'operator-to-scheme'
        })
      )
      document.body.innerHTML = DETAIL_HTML
      installPayload({
        view: 'detail',
        target: 'hydrate',
        evidenceId: evidence.id
      })
      runOperatorEvidencePage(document, { assign: assignSpy })
      expect(
        document.querySelector('[data-testid="evidence-detail-not-found"]')
          .hidden
      ).toBe(true)
      expect(
        document.querySelector('[data-testid="evidence-detail-list"]').hidden
      ).toBe(false)
      expect(
        document.querySelector('[data-testid="evidence-detail-scheme"]')
          .textContent
      ).toBe(scheme.name)
      expect(
        document.querySelector('[data-testid="evidence-detail-tonnes"]')
          .textContent
      ).toBe('2.500')
    })

    test('shows not-found when evidence does not belong to operator', () => {
      seedOperator()
      storage.saveEvidence(
        createEvidence({
          id: 'other-evidence',
          issuedByOperatorId: 'other-operator'
        })
      )
      document.body.innerHTML = DETAIL_HTML
      installPayload({
        view: 'detail',
        target: 'hydrate',
        evidenceId: 'other-evidence'
      })
      runOperatorEvidencePage(document, { assign: assignSpy })
      expect(
        document.querySelector('[data-testid="evidence-detail-not-found"]')
          .hidden
      ).toBe(false)
    })

    test('shows not-found when evidence id does not exist', () => {
      seedOperator()
      document.body.innerHTML = DETAIL_HTML
      installPayload({
        view: 'detail',
        target: 'hydrate',
        evidenceId: 'nonexistent'
      })
      runOperatorEvidencePage(document, { assign: assignSpy })
      expect(
        document.querySelector('[data-testid="evidence-detail-not-found"]')
          .hidden
      ).toBe(false)
    })

    test('unknown view returns hydrated', () => {
      seedOperator()
      document.body.innerHTML = ''
      installPayload({ view: 'unknown', target: 'hydrate' })
      expect(runOperatorEvidencePage(document, { assign: assignSpy })).toBe(
        'hydrated'
      )
    })

    test('shows dates as dash when not set', () => {
      const op = seedOperator()
      const evidence = storage.saveEvidence(
        createEvidence({
          issuedByOperatorId: op.id,
          direction: 'operator-to-scheme'
        })
      )
      document.body.innerHTML = DETAIL_HTML
      installPayload({
        view: 'detail',
        target: 'hydrate',
        evidenceId: evidence.id
      })
      runOperatorEvidencePage(document, { assign: assignSpy })
      expect(
        document.querySelector('[data-testid="evidence-detail-dates"]')
          .textContent
      ).toBe('—')
    })
  })
})
