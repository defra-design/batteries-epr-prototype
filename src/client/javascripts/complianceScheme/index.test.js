// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { initComplianceSchemeDashboard } from './index.js'
import { storage } from '../storage-adapter.js'

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
    viewAction: 'View application'
  },
  members: { manageAction: 'Manage members' },
  evidence: {
    manageAction: 'Manage evidence',
    availabilityOn: 'Available to members & partners',
    availabilityOff: 'Not available to members',
    availabilityToggleAction: 'Change availability'
  },
  quarterly: {
    disabledHint: 'Available after your scheme is approved.',
    startAction: 'Start',
    continueAction: 'Continue',
    viewAction: 'View',
    statuses: {
      'not-started': 'Not started',
      'in-progress': 'In progress',
      submitted: 'Submitted'
    }
  },
  ia: {
    disabledHint: 'Available after your scheme is approved.',
    startAction: 'Start',
    continueAction: 'Continue',
    viewAction: 'View'
  },
  obligationBreakdown: { viewAction: 'View obligation breakdown' }
}

const PAYLOAD = {
  compliancePeriodYear: '2026',
  urls: {
    applicationStart: '/compliance-scheme/application/scheme-details',
    applicationCheckAnswers: '/compliance-scheme/application/check-answers',
    members: '/compliance-scheme/members',
    evidence: '/compliance-scheme/evidence',
    evidenceAvailability: '/compliance-scheme/evidence/availability',
    quarterly: '/compliance-scheme/quarterly/{quarter}/{step}',
    ia: '/compliance-scheme/industrial-automotive/{step}',
    obligation: '/compliance-scheme/obligation'
  },
  copy: COPY,
  debug: {
    fastForwardEnabled: false,
    fastForwardLabel: 'Mark scheme as approved (debug)',
    fastForwardConfirmation: 'Scheme marked as approved.'
  }
}

const buildDom = (payload = PAYLOAD) => {
  document.body.innerHTML = `
    <div id="compliance-scheme-dashboard">
      <span data-testid="tile-approval-status"></span>
      <p data-testid="tile-approval-meta"></p>
      <p data-testid="tile-approval-action"></p>
      <p data-testid="tile-members-count"></p>
      <p data-testid="tile-members-action"></p>
      <dd data-testid="tile-evidence-accepted"></dd>
      <dd data-testid="tile-evidence-awaiting"></dd>
      <dd data-testid="tile-evidence-obligation"></dd>
      <dd data-testid="tile-evidence-delta"></dd>
      <p data-testid="tile-evidence-action"></p>
      <p data-testid="tile-evidence-availability"></p>
      <p data-testid="tile-quarterly-hint"></p>
      <ul data-testid="tile-quarterly-list"></ul>
      <span data-testid="tile-ia-status"></span>
      <p data-testid="tile-ia-hint"></p>
      <p data-testid="tile-ia-action"></p>
      <p data-testid="tile-obligation-action"></p>
    </div>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

beforeEach(() => {
  globalThis.localStorage.clear()
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('initComplianceSchemeDashboard', () => {
  test('seeds and renders the approved scheme tiles end-to-end', () => {
    buildDom()
    expect(initComplianceSchemeDashboard(document)).toBe('rendered')

    expect(
      document.querySelector('[data-testid="tile-approval-status"]').textContent
    ).toBe('Approved')
    const meta = document.querySelector(
      '[data-testid="tile-approval-meta"]'
    ).textContent
    expect(meta).toMatch(/Approval number: BCS2010864\/E/)
    expect(meta).toMatch(/Approved on/)
    expect(
      document.querySelector('[data-testid="tile-approval-action"] a').textContent
    ).toBe('View application')

    expect(
      document.querySelector('[data-testid="tile-members-count"]').textContent
    ).toBe('0 active members')

    expect(
      document.querySelector('[data-testid="tile-evidence-accepted"]').textContent
    ).toBe('0.000')
    const availability = document.querySelector(
      '[data-testid="tile-evidence-availability"]'
    )
    expect(availability.textContent).toMatch(/Available to members & partners/)
    expect(availability.innerHTML).toContain('Available to members &amp; partners')

    expect(
      document.querySelector('[data-testid="tile-quarterly-hint"]').textContent
    ).toBe('')
    expect(
      document.querySelectorAll('li[data-testid^="tile-quarterly-Q"]')
    ).toHaveLength(4)
    expect(
      document.querySelector('[data-testid="tile-quarterly-Q1-link"]')
        .textContent
    ).toBe('Start')

    expect(
      document.querySelector('[data-testid="tile-ia-action"] a').textContent
    ).toBe('Start')

    expect(
      document.querySelector('[data-testid="tile-obligation-action"] a').href
    ).toMatch(/\/compliance-scheme\/obligation$/)
  })

  test('gates quarterly and ia tiles when scheme not approved', () => {
    buildDom()
    storage.seedDemoData()
    const notStarted = storage
      .listSchemes()
      .find((s) => s.approvalStatus === 'not-started')
    storage.saveScheme({ ...notStarted, approvalStatus: 'not-started' })
    for (const scheme of storage.listSchemes()) {
      if (scheme.approvalStatus === 'approved') {
        storage.saveScheme({ ...scheme, approvalStatus: 'not-started' })
      }
    }

    initComplianceSchemeDashboard(document)

    expect(
      document.querySelector('[data-testid="tile-quarterly-hint"]').textContent
    ).toBe('Available after your scheme is approved.')
    expect(
      document.querySelector('[data-testid="tile-quarterly-Q1-link"]')
    ).toBeNull()
    expect(
      document.querySelector('[data-testid="tile-ia-action"]').innerHTML
    ).toBe('')
  })

  test('renders submitted approval state with submission date in meta', () => {
    buildDom()
    storage.seedDemoData()
    for (const scheme of storage.listSchemes()) {
      storage.saveScheme({
        ...scheme,
        approvalStatus: 'submitted',
        approvalNumber: null,
        submittedOn: '2026-02-01T00:00:00Z'
      })
    }

    initComplianceSchemeDashboard(document)

    expect(
      document.querySelector('[data-testid="tile-approval-status"]').textContent
    ).toBe('Submitted')
    expect(
      document.querySelector('[data-testid="tile-approval-meta"]').textContent
    ).toMatch(/Submitted on/)
  })

  test('renders in-progress approval and submitted quarter / in-progress IA states', () => {
    buildDom()
    storage.seedDemoData()
    const approved = storage
      .listSchemes()
      .find((s) => s.approvalStatus === 'approved')
    storage.saveScheme({
      ...approved,
      approvalStatus: 'in-progress',
      approvalNumber: null,
      approvedOn: null,
      submittedOn: null
    })
    storage.saveQuarterlySubmission({
      schemeId: approved.id,
      compliancePeriodYear: '2026',
      quarter: 'Q1',
      status: 'submitted'
    })
    storage.saveQuarterlySubmission({
      schemeId: approved.id,
      compliancePeriodYear: '2026',
      quarter: 'Q2',
      status: 'in-progress'
    })
    storage.saveIaSubmission({
      schemeId: approved.id,
      compliancePeriodYear: '2026',
      status: 'in-progress'
    })

    initComplianceSchemeDashboard(document)

    const approvalStatus = document.querySelector(
      '[data-testid="tile-approval-status"]'
    )
    expect(approvalStatus.textContent).toBe('In progress')
    expect(approvalStatus.innerHTML).toContain('govuk-tag--yellow')

    expect(
      document.querySelector('[data-testid="tile-approval-action"] a')
        .textContent
    ).toBe('Continue application')

    expect(
      document.querySelector('[data-testid="tile-quarterly-Q1"]').innerHTML
    ).toContain('govuk-tag--blue')
    expect(
      document.querySelector('[data-testid="tile-quarterly-Q2"]').innerHTML
    ).toContain('govuk-tag--yellow')

    expect(
      document.querySelector('[data-testid="tile-ia-status"]').innerHTML
    ).toContain('govuk-tag--yellow')
  })

  test('fast-forward debug button updates scheme to approved and reloads', () => {
    const payload = {
      ...PAYLOAD,
      debug: {
        fastForwardEnabled: true,
        fastForwardLabel: 'Mark scheme as approved (debug)',
        fastForwardConfirmation: 'Scheme marked as approved.'
      }
    }
    document.body.innerHTML = `
      <div id="compliance-scheme-dashboard">
        <span data-testid="tile-approval-status"></span>
        <p data-testid="tile-approval-meta"></p>
        <p data-testid="tile-approval-action"></p>
        <p data-testid="tile-members-count"></p>
        <p data-testid="tile-members-action"></p>
        <dd data-testid="tile-evidence-accepted"></dd>
        <dd data-testid="tile-evidence-awaiting"></dd>
        <dd data-testid="tile-evidence-obligation"></dd>
        <dd data-testid="tile-evidence-delta"></dd>
        <p data-testid="tile-evidence-action"></p>
        <p data-testid="tile-evidence-availability"></p>
        <p data-testid="tile-quarterly-hint"></p>
        <ul data-testid="tile-quarterly-list"></ul>
        <span data-testid="tile-ia-status"></span>
        <p data-testid="tile-ia-hint"></p>
        <p data-testid="tile-ia-action"></p>
        <p data-testid="tile-obligation-action"></p>
        <button data-testid="debug-fast-forward">Fast forward</button>
        <p data-testid="debug-fast-forward-message" hidden>Done</p>
      </div>
      <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
    `

    storage.seedDemoData()
    for (const scheme of storage.listSchemes()) {
      storage.saveScheme({
        ...scheme,
        approvalStatus: 'not-started',
        approvalNumber: null,
        approvedOn: null,
        submittedOn: null
      })
    }

    const reloadSpy = vi.fn()
    Object.defineProperty(globalThis, 'location', {
      value: { reload: reloadSpy, assign: vi.fn() },
      writable: true,
      configurable: true
    })

    initComplianceSchemeDashboard(document, globalThis.location)
    document.querySelector('[data-testid="debug-fast-forward"]').click()

    const [scheme] = storage.listSchemes()
    expect(scheme.approvalStatus).toBe('approved')
    expect(scheme.approvalNumber).toBe('BCS/DEBUG/001')
    expect(scheme.approvedOn).toBeTruthy()
    expect(scheme.submittedOn).toBeTruthy()
    expect(
      document.querySelector('[data-testid="debug-fast-forward-message"]').hidden
    ).toBe(false)
    expect(reloadSpy).toHaveBeenCalled()
  })

  test('fast-forward keeps existing approval number when one is already set', () => {
    const payload = {
      ...PAYLOAD,
      debug: {
        fastForwardEnabled: true,
        fastForwardLabel: 'Mark approved',
        fastForwardConfirmation: 'Done.'
      }
    }
    document.body.innerHTML = `
      <div>
        <span data-testid="tile-approval-status"></span>
        <p data-testid="tile-approval-meta"></p>
        <p data-testid="tile-approval-action"></p>
        <p data-testid="tile-members-count"></p>
        <p data-testid="tile-members-action"></p>
        <dd data-testid="tile-evidence-accepted"></dd>
        <dd data-testid="tile-evidence-awaiting"></dd>
        <dd data-testid="tile-evidence-obligation"></dd>
        <dd data-testid="tile-evidence-delta"></dd>
        <p data-testid="tile-evidence-action"></p>
        <p data-testid="tile-evidence-availability"></p>
        <p data-testid="tile-quarterly-hint"></p>
        <ul data-testid="tile-quarterly-list"></ul>
        <span data-testid="tile-ia-status"></span>
        <p data-testid="tile-ia-hint"></p>
        <p data-testid="tile-ia-action"></p>
        <p data-testid="tile-obligation-action"></p>
        <button data-testid="debug-fast-forward">Fast forward</button>
        <p data-testid="debug-fast-forward-message" hidden>Done</p>
      </div>
      <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
    `

    Object.defineProperty(globalThis, 'location', {
      value: { reload: vi.fn(), assign: vi.fn() },
      writable: true,
      configurable: true
    })

    initComplianceSchemeDashboard(document, globalThis.location)
    document.querySelector('[data-testid="debug-fast-forward"]').click()

    const [scheme] = storage.listSchemes()
    expect(scheme.approvalNumber).toBe('BCS2010864/E')
    expect(scheme.submittedOn).toBe('2009-12-01T00:00:00Z')
  })

  test('members tile only counts members who joined on or before the active year', () => {
    buildDom()
    storage.seedDemoData()
    const [scheme] = storage.listSchemes()
    storage.saveSchemeMember({
      id: 'past-member',
      version: 0,
      schemeId: scheme.id,
      producerBprn: 'BPRN-PAST',
      companyName: 'Past',
      joinedOn: '2026-04-01T00:00:00Z',
      leftOn: null,
      createdAt: '2026-04-01T00:00:00Z',
      updatedAt: '2026-04-01T00:00:00Z'
    })
    storage.saveSchemeMember({
      id: 'future-member',
      version: 0,
      schemeId: scheme.id,
      producerBprn: 'BPRN-FUTURE',
      companyName: 'Future',
      joinedOn: '2028-04-01T00:00:00Z',
      leftOn: null,
      createdAt: '2028-04-01T00:00:00Z',
      updatedAt: '2028-04-01T00:00:00Z'
    })

    initComplianceSchemeDashboard(document)
    expect(
      document.querySelector('[data-testid="tile-members-count"]').textContent
    ).toBe('1 active members')

    buildDom({ ...PAYLOAD, compliancePeriodYear: '2025' })
    initComplianceSchemeDashboard(document)
    expect(
      document.querySelector('[data-testid="tile-members-count"]').textContent
    ).toBe('0 active members')

    buildDom({ ...PAYLOAD, compliancePeriodYear: '2028' })
    initComplianceSchemeDashboard(document)
    expect(
      document.querySelector('[data-testid="tile-members-count"]').textContent
    ).toBe('2 active members')
  })

  test('falls back to empty state when no scheme is seeded', () => {
    buildDom()
    storage.seedDemoData()
    globalThis.localStorage.removeItem('npwd-batteries:schemes')

    initComplianceSchemeDashboard(document)

    expect(
      document.querySelector('[data-testid="tile-approval-status"]').textContent
    ).toBe('Not started')
    expect(
      document.querySelector('[data-testid="tile-approval-meta"]').textContent
    ).toBe('')
  })
})
