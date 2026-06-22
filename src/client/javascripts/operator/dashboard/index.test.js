// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { initOperatorDashboard } from './index.js'
import {
  storage,
  createOperator,
  createEvidence,
  createOperatorQuarterlyReturn,
  createOperatorAnnualReturn
} from '../../storage-adapter.js'

const COPY = {
  approval: {
    statuses: {
      'not-started': 'Not started',
      'in-progress': 'In progress',
      submitted: 'Submitted',
      approved: 'Approved'
    },
    startAction: 'Start application',
    continueAction: 'Continue application',
    viewAction: 'View approval'
  },
  evidence: {
    issueAction: 'Issue a new evidence note'
  },
  quarterly: {
    disabledHint: 'Available after your approval is granted.',
    startAction: 'Start',
    continueAction: 'Continue',
    viewAction: 'View',
    statuses: {
      'not-started': 'Not started',
      'in-progress': 'In progress',
      submitted: 'Submitted'
    }
  },
  annual: {
    disabledHint: 'Available after your approval is granted.',
    startAction: 'Start',
    continueAction: 'Continue',
    viewAction: 'View',
    statuses: {
      'not-started': 'Not started',
      'in-progress': 'In progress',
      submitted: 'Submitted'
    }
  }
}

const URLS = {
  applicationStart: '/operator/application/operator-details',
  applicationCheckAnswers: '/operator/application/declaration',
  evidence: '/operator/evidence',
  evidenceIssue: '/operator/evidence/issue/scheme',
  quarterly: '/operator/quarterly/{quarter}/{step}',
  annualReturn: '/operator/annual-return/{step}'
}

const PAYLOAD = {
  compliancePeriodYear: '2026',
  urls: URLS,
  copy: COPY,
  debug: { fastForwardEnabled: false }
}

const dashboardHtml = `
  <div data-testid="app-heading-title"></div>
  <div data-testid="tile-approval-status"></div>
  <div data-testid="tile-approval-type"></div>
  <div data-testid="tile-approval-meta"></div>
  <div data-testid="tile-approval-action"></div>
  <div data-testid="tile-evidence-summary"></div>
  <div data-testid="tile-evidence-action"></div>
  <div data-testid="tile-quarterly-container">
    <div data-testid="tile-quarterly-hint"></div>
    <ul data-testid="tile-quarterly-list"></ul>
  </div>
  <div data-testid="tile-annual-container">
    <div data-testid="tile-annual-status"></div>
    <div data-testid="tile-annual-hint"></div>
    <div data-testid="tile-annual-action"></div>
  </div>
  <script id="page-payload" type="application/json">${JSON.stringify(PAYLOAD)}</script>
`

let assignSpy

const seedOperator = (overrides = {}) => {
  const op = createOperator({
    id: '33333333-0001-4000-a000-000000000001',
    name: 'Green & Recycling Ltd',
    approvalType: 'abto',
    approvalNumber: 'ABTO-EA-2026-000001',
    approvalStatus: 'approved',
    approvedOn: '2026-01-15T00:00:00Z',
    batteryTypes: { isPortable: true, isIndustrial: true, isAutomotive: false },
    ...overrides
  })
  storage.saveOperator(op)
  storage.setCurrentOperatorId(op.id)
  return op
}

beforeEach(() => {
  globalThis.localStorage.clear()
  assignSpy = vi.fn()
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('initOperatorDashboard', () => {
  test('redirects to sign-in if no current operator', () => {
    document.body.innerHTML = dashboardHtml
    expect(initOperatorDashboard(document, { assign: assignSpy })).toBe(
      'redirected-to-sign-in'
    )
    expect(assignSpy).toHaveBeenCalledWith('/operator/sign-in')
  })

  test('renders operator name in heading', () => {
    seedOperator()
    document.body.innerHTML = dashboardHtml
    initOperatorDashboard(document, { assign: assignSpy })
    expect(
      document.querySelector('[data-testid="app-heading-title"]').textContent
    ).toBe('Green & Recycling Ltd')
  })

  test('renders approval tile with approved status', () => {
    seedOperator()
    document.body.innerHTML = dashboardHtml
    initOperatorDashboard(document, { assign: assignSpy })
    expect(
      document.querySelector('[data-testid="tile-approval-status"]').innerHTML
    ).toContain('Approved')
    expect(
      document.querySelector('[data-testid="tile-approval-type"]').textContent
    ).toBe('Approved Battery Treatment Operator')
    expect(
      document.querySelector('[data-testid="tile-approval-meta"]').textContent
    ).toContain('ABTO-EA-2026-000001')
  })

  test('renders evidence tile with BEN count and action links', () => {
    const op = seedOperator()
    storage.saveEvidence(
      createEvidence({
        issuedByOperatorId: op.id,
        compliancePeriodYear: '2026',
        tonnes: '2.500',
        direction: 'operator-to-scheme'
      })
    )
    document.body.innerHTML = dashboardHtml
    initOperatorDashboard(document, { assign: assignSpy })
    expect(
      document.querySelector('[data-testid="tile-evidence-summary"]').textContent
    ).toContain('1 BEN issued')
    expect(
      document.querySelector('[data-testid="tile-evidence-summary"]').textContent
    ).toContain('2.500 tonnes')
    expect(
      document.querySelector('[data-testid="tile-evidence-action"]').innerHTML
    ).toContain(URLS.evidence)
  })

  test('hides evidence action links when operator is not approved', () => {
    seedOperator({ approvalStatus: 'not-started', approvalNumber: null, approvedOn: null })
    document.body.innerHTML = dashboardHtml
    initOperatorDashboard(document, { assign: assignSpy })
    expect(
      document.querySelector('[data-testid="tile-evidence-action"]').innerHTML
    ).toBe('')
  })

  test('renders approval action link for approved operator', () => {
    seedOperator()
    document.body.innerHTML = dashboardHtml
    initOperatorDashboard(document, { assign: assignSpy })
    const actionHtml = document.querySelector(
      '[data-testid="tile-approval-action"]'
    ).innerHTML
    expect(actionHtml).toContain('View approval')
    expect(actionHtml).toContain(URLS.applicationCheckAnswers)
  })

  test('renders Start application link for not-started operator', () => {
    seedOperator({ approvalStatus: 'not-started', approvalNumber: null, approvedOn: null })
    document.body.innerHTML = dashboardHtml
    initOperatorDashboard(document, { assign: assignSpy })
    const actionHtml = document.querySelector(
      '[data-testid="tile-approval-action"]'
    ).innerHTML
    expect(actionHtml).toContain('Start application')
    expect(actionHtml).toContain(URLS.applicationStart)
  })

  test('renders Continue application link for in-progress operator', () => {
    seedOperator({ approvalStatus: 'in-progress', approvalNumber: null, approvedOn: null })
    document.body.innerHTML = dashboardHtml
    initOperatorDashboard(document, { assign: assignSpy })
    const actionHtml = document.querySelector(
      '[data-testid="tile-approval-action"]'
    ).innerHTML
    expect(actionHtml).toContain('Continue application')
    expect(actionHtml).toContain(URLS.applicationStart)
  })

  test('renders ABE type label correctly', () => {
    seedOperator({ approvalType: 'abe', approvalNumber: 'ABE-EA-2026-000001' })
    document.body.innerHTML = dashboardHtml
    initOperatorDashboard(document, { assign: assignSpy })
    expect(
      document.querySelector('[data-testid="tile-approval-type"]').textContent
    ).toBe('Approved Battery Exporter')
  })

  test('renders quarterly tile when operator handles portable', () => {
    seedOperator()
    document.body.innerHTML = dashboardHtml
    initOperatorDashboard(document, { assign: assignSpy })
    const container = document.querySelector(
      '[data-testid="tile-quarterly-container"]'
    )
    expect(container.hidden).toBeFalsy()
    expect(
      document.querySelector('[data-testid="tile-quarterly-list"]').innerHTML
    ).toContain('Q1')
  })

  test('hides quarterly tile when operator does not handle portable', () => {
    seedOperator({
      batteryTypes: { isPortable: false, isIndustrial: false, isAutomotive: true }
    })
    document.body.innerHTML = dashboardHtml
    initOperatorDashboard(document, { assign: assignSpy })
    expect(
      document.querySelector('[data-testid="tile-quarterly-container"]').hidden
    ).toBe(true)
  })

  test('hides annual tile when operator does not handle industrial or automotive', () => {
    seedOperator({
      batteryTypes: { isPortable: true, isIndustrial: false, isAutomotive: false }
    })
    document.body.innerHTML = dashboardHtml
    initOperatorDashboard(document, { assign: assignSpy })
    expect(
      document.querySelector('[data-testid="tile-annual-container"]').hidden
    ).toBe(true)
  })

  test('shows annual tile when operator handles industrial', () => {
    seedOperator({
      batteryTypes: { isPortable: false, isIndustrial: true, isAutomotive: false }
    })
    document.body.innerHTML = dashboardHtml
    initOperatorDashboard(document, { assign: assignSpy })
    expect(
      document.querySelector('[data-testid="tile-annual-container"]').hidden
    ).toBeFalsy()
  })

  test('quarterly tile shows submitted status and view link', () => {
    const op = seedOperator()
    storage.saveOperatorQuarterlyReturn(
      createOperatorQuarterlyReturn({
        operatorId: op.id,
        compliancePeriodYear: '2026',
        quarter: 'Q1',
        status: 'submitted'
      })
    )
    document.body.innerHTML = dashboardHtml
    initOperatorDashboard(document, { assign: assignSpy })
    const q1Html = document.querySelector('[data-testid="tile-quarterly-Q1"]').innerHTML
    expect(q1Html).toContain('Submitted')
    expect(q1Html).toContain('View')
  })

  test('quarterly tile shows in-progress status and continue link', () => {
    const op = seedOperator()
    storage.saveOperatorQuarterlyReturn(
      createOperatorQuarterlyReturn({
        operatorId: op.id,
        compliancePeriodYear: '2026',
        quarter: 'Q2',
        status: 'in-progress'
      })
    )
    document.body.innerHTML = dashboardHtml
    initOperatorDashboard(document, { assign: assignSpy })
    const q2Html = document.querySelector('[data-testid="tile-quarterly-Q2"]').innerHTML
    expect(q2Html).toContain('In progress')
    expect(q2Html).toContain('Continue')
  })

  test('annual tile shows in-progress status and continue link', () => {
    const op = seedOperator({
      batteryTypes: { isPortable: false, isIndustrial: true, isAutomotive: false }
    })
    storage.saveOperatorAnnualReturn(
      createOperatorAnnualReturn({
        operatorId: op.id,
        compliancePeriodYear: '2026',
        status: 'in-progress'
      })
    )
    document.body.innerHTML = dashboardHtml
    initOperatorDashboard(document, { assign: assignSpy })
    const actionHtml = document.querySelector('[data-testid="tile-annual-action"]').innerHTML
    expect(actionHtml).toContain('Continue')
    expect(actionHtml).toContain('/operator/annual-return/tonnages')
  })

  test('annual tile shows submitted status and view link', () => {
    const op = seedOperator({
      batteryTypes: { isPortable: false, isIndustrial: true, isAutomotive: false }
    })
    storage.saveOperatorAnnualReturn(
      createOperatorAnnualReturn({
        operatorId: op.id,
        compliancePeriodYear: '2026',
        status: 'submitted'
      })
    )
    document.body.innerHTML = dashboardHtml
    initOperatorDashboard(document, { assign: assignSpy })
    const actionHtml = document.querySelector('[data-testid="tile-annual-action"]').innerHTML
    expect(actionHtml).toContain('View')
    expect(actionHtml).toContain('/operator/annual-return/declaration')
  })

  test('annual tile shows start link for not-started', () => {
    seedOperator({
      batteryTypes: { isPortable: false, isIndustrial: true, isAutomotive: false }
    })
    document.body.innerHTML = dashboardHtml
    initOperatorDashboard(document, { assign: assignSpy })
    const actionHtml = document.querySelector('[data-testid="tile-annual-action"]').innerHTML
    expect(actionHtml).toContain('Start')
    expect(actionHtml).toContain('/operator/annual-return/tonnages')
  })

  test('shows gated hints when operator is not approved', () => {
    seedOperator({ approvalStatus: 'not-started', approvalNumber: null, approvedOn: null })
    document.body.innerHTML = dashboardHtml
    initOperatorDashboard(document, { assign: assignSpy })
    expect(
      document.querySelector('[data-testid="tile-quarterly-hint"]').textContent
    ).toBe('Available after your approval is granted.')
    expect(
      document.querySelector('[data-testid="tile-annual-hint"]').textContent
    ).toBe('Available after your approval is granted.')
  })

  test('returns rendered on success', () => {
    seedOperator()
    document.body.innerHTML = dashboardHtml
    expect(initOperatorDashboard(document, { assign: assignSpy })).toBe(
      'rendered'
    )
  })

  test('renders approval tile with unknown approval type falls back to raw type', () => {
    seedOperator({ approvalType: 'unknown-type' })
    document.body.innerHTML = dashboardHtml
    initOperatorDashboard(document, { assign: assignSpy })
    expect(
      document.querySelector('[data-testid="tile-approval-type"]').textContent
    ).toBe('unknown-type')
  })

  test('renders approval tile without approvalStatus defaults to not-started', () => {
    const op = createOperator({
      id: '33333333-0001-4000-a000-000000000099',
      name: 'No Status Op',
      approvalType: 'abto',
      batteryTypes: { isPortable: true, isIndustrial: true, isAutomotive: false }
    })
    delete op.approvalStatus
    storage.saveOperator(op)
    storage.setCurrentOperatorId(op.id)
    document.body.innerHTML = dashboardHtml
    initOperatorDashboard(document, { assign: assignSpy })
    expect(
      document.querySelector('[data-testid="tile-approval-status"]').innerHTML
    ).toContain('Not started')
  })

  test('attaches debug fast-forward handler when enabled', () => {
    seedOperator({ approvalStatus: 'not-started', approvalNumber: null, approvedOn: null })
    const debugPayload = {
      ...PAYLOAD,
      debug: { fastForwardEnabled: true }
    }
    document.body.innerHTML = `
      <div data-testid="app-heading-title"></div>
      <div data-testid="tile-approval-status"></div>
      <div data-testid="tile-approval-type"></div>
      <div data-testid="tile-approval-meta"></div>
      <div data-testid="tile-approval-action"></div>
      <div data-testid="tile-evidence-summary"></div>
      <div data-testid="tile-quarterly-container">
        <div data-testid="tile-quarterly-hint"></div>
        <ul data-testid="tile-quarterly-list"></ul>
      </div>
      <div data-testid="tile-annual-container">
        <div data-testid="tile-annual-status"></div>
        <div data-testid="tile-annual-hint"></div>
      </div>
      <button data-testid="debug-fast-forward"></button>
      <p data-testid="debug-fast-forward-message" hidden></p>
      <script id="page-payload" type="application/json">${JSON.stringify(debugPayload)}</script>
    `
    const reloadSpy = vi.fn()
    initOperatorDashboard(document, { assign: assignSpy, reload: reloadSpy })
    document.querySelector('[data-testid="debug-fast-forward"]').click()
    const updated = storage.currentOperator()
    expect(updated.approvalStatus).toBe('approved')
    expect(updated.approvalNumber).toBe('ABTO/DEBUG/001')
    expect(
      document.querySelector('[data-testid="debug-fast-forward-message"]').hidden
    ).toBe(false)
    expect(reloadSpy).toHaveBeenCalled()
  })

  test('debug fast-forward for ABE generates ABE approval number', () => {
    seedOperator({
      approvalType: 'abe',
      approvalStatus: 'not-started',
      approvalNumber: null,
      approvedOn: null
    })
    const debugPayload = {
      ...PAYLOAD,
      debug: { fastForwardEnabled: true }
    }
    document.body.innerHTML = `
      <div data-testid="app-heading-title"></div>
      <div data-testid="tile-approval-status"></div>
      <div data-testid="tile-approval-type"></div>
      <div data-testid="tile-approval-meta"></div>
      <div data-testid="tile-approval-action"></div>
      <div data-testid="tile-evidence-summary"></div>
      <div data-testid="tile-quarterly-container">
        <div data-testid="tile-quarterly-hint"></div>
        <ul data-testid="tile-quarterly-list"></ul>
      </div>
      <div data-testid="tile-annual-container">
        <div data-testid="tile-annual-status"></div>
        <div data-testid="tile-annual-hint"></div>
      </div>
      <button data-testid="debug-fast-forward"></button>
      <p data-testid="debug-fast-forward-message" hidden></p>
      <script id="page-payload" type="application/json">${JSON.stringify(debugPayload)}</script>
    `
    const reloadSpy = vi.fn()
    initOperatorDashboard(document, { assign: assignSpy, reload: reloadSpy })
    document.querySelector('[data-testid="debug-fast-forward"]').click()
    expect(storage.currentOperator().approvalNumber).toBe('ABE/DEBUG/001')
  })
})
