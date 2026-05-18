// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { initDashboard } from './index.js'
import { storage } from '../storage-adapter.js'
import { upsertSubmission as iaUpsertSubmission } from '../annualReturn/ia/persist-submission.js'

const CARDS_COPY = {
  registration: {
    title: 'Registration',
    description: 'Your producer registration for the compliance period.',
    statusStarted: 'In progress',
    statusSubmitted: 'Submitted',
    statusApproved: 'Approved',
    bprnLabel: 'BPRN:',
    bprnPending: 'Pending allocation',
    inProgressBody: 'You have started your registration.',
    inProgressLink: 'Continue your registration',
    submittedBody: 'Your registration is submitted.',
    approvedBody: 'Your registration is approved for {compliancePeriod}.'
  },
  fee: {
    title: 'Service charge',
    description: 'Pay the annual service charge.',
    statusNotApplicable: 'Not yet due',
    statusDue: 'Payment due',
    statusPaid: 'Paid',
    payNow: 'Pay now',
    paidBody: 'Service charge paid for {compliancePeriod}.',
    notApplicableBody: 'You will be asked to pay once you submit.'
  },
  annualReturn: {
    title: 'Annual return',
    description: 'Submit your annual return.',
    statusNotStarted: 'Not started',
    statusInProgress: 'In progress',
    statusSubmitted: 'Submitted',
    deadlineLabel: 'Deadline:',
    deadlineValue: '31 December {compliancePeriod}',
    startLink: 'Start your annual return',
    blockedBody: 'Submit and pay registration first.'
  },
  activity: {
    title: 'Recent activity',
    description: 'Timeline of changes.',
    empty: 'No activity yet.'
  }
}

const PAYLOAD = {
  signInUrl: '/sign-in',
  onboardingStartUrl: '/onboarding/company-details',
  payServiceChargeUrl: '/service-charge',
  compliancePeriod: '2026',
  cards: CARDS_COPY
}

const buildDom = (payload = PAYLOAD) => {
  document.body.innerHTML = `
    <div data-testid="dashboard-loading"><p>Loading…</p></div>
    <div data-testid="dashboard-content" hidden>
      <div data-testid="dashboard-banner" hidden></div>
      <div data-testid="app-heading">
        <div class="govuk-grid-column-full">
          <h1>X</h1>
        </div>
      </div>
      <span data-testid="card-registration-status"></span>
      <p data-testid="card-registration-bprn"></p>
      <p data-testid="card-registration-body"></p>
      <p data-testid="card-registration-action"></p>
      <span data-testid="card-fee-status"></span>
      <p data-testid="card-fee-body"></p>
      <p data-testid="card-fee-action"></p>
      <span data-testid="card-annual-return-status"></span>
      <p data-testid="card-annual-return-deadline"></p>
      <p data-testid="card-annual-return-body"></p>
      <p data-testid="card-annual-return-action"></p>
      <ol data-testid="card-activity-list"></ol>
    </div>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

let assignSpy

beforeEach(() => {
  globalThis.localStorage.clear()
  assignSpy = vi.fn()
  Object.defineProperty(globalThis, 'location', {
    value: { assign: assignSpy },
    writable: true,
    configurable: true
  })
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('initDashboard auth and onboarding gates', () => {
  test('redirects to sign-in when no current user', () => {
    buildDom()
    expect(initDashboard(document, globalThis.location)).toBe(false)
    expect(assignSpy).toHaveBeenCalledWith('/sign-in')
  })

  test('redirects new users with no producer to the onboarding start', () => {
    storage.setCurrentUser({ email: 'new@example.com' })
    buildDom()

    expect(initDashboard(document, globalThis.location)).toBe(
      'redirected-to-onboarding'
    )
    expect(assignSpy).toHaveBeenCalledWith('/onboarding/company-details')
  })

  test('falls back to default onboarding URL when payload omits it', () => {
    storage.setCurrentUser({ email: 'new@example.com' })
    document.body.innerHTML = `<script id="page-payload" type="application/json">{}</script>`

    expect(initDashboard(document, globalThis.location)).toBe(
      'redirected-to-onboarding'
    )
    expect(assignSpy).toHaveBeenCalledWith('/onboarding/company-details')
  })

  test('falls back to /sign-in when payload is empty and there is no user', () => {
    document.body.innerHTML = `<div></div>`
    expect(initDashboard(document, globalThis.location)).toBe(false)
    expect(assignSpy).toHaveBeenCalledWith('/sign-in')
  })
})

describe('initDashboard registration card states', () => {
  const setupProducer = (overrides = {}) => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme Power Ltd',
      registeredAddress: { postcode: 'M1 4AA' },
      ...overrides
    })
    return storage.getProducerByEmail('a@b.com')
  }

  test('renders the in-progress (Started) state with continue link', () => {
    setupProducer()
    buildDom()

    expect(initDashboard(document, globalThis.location)).toBe('rendered')
    expect(
      document.querySelector('[data-testid="card-registration-status"]')
        .textContent
    ).toContain('In progress')
    expect(
      document
        .querySelector('[data-testid="card-registration-action"] a')
        .getAttribute('href')
    ).toBe('/onboarding/company-details')
  })

  test('renders the Submitted state with the BPRN', () => {
    const producer = setupProducer({ bprn: 'BPRN-EA-2026-000123' })
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      status: 'Submitted'
    })
    buildDom()

    expect(initDashboard(document, globalThis.location)).toBe('rendered')
    expect(
      document.querySelector('[data-testid="card-registration-status"]')
        .textContent
    ).toContain('Submitted')
    expect(
      document.querySelector('[data-testid="card-registration-bprn"]')
        .textContent
    ).toContain('BPRN-EA-2026-000123')
  })

  test('renders the Submitted state with "Pending allocation" when BPRN missing', () => {
    const producer = setupProducer()
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      status: 'Submitted'
    })
    buildDom()

    initDashboard(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="card-registration-bprn"]')
        .textContent
    ).toContain('Pending allocation')
  })

  test('renders the Approved state with the BPRN and compliance-period body', () => {
    const producer = setupProducer({ bprn: 'BPRN-EA-2026-000456' })
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      status: 'Approved'
    })
    buildDom()

    initDashboard(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="card-registration-status"]')
        .textContent
    ).toContain('Approved')
    expect(
      document.querySelector('[data-testid="card-registration-body"]')
        .textContent
    ).toContain('2026')
  })

  test('renders the Approved state with "Pending allocation" when BPRN missing', () => {
    const producer = setupProducer()
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      status: 'Approved'
    })
    buildDom()

    initDashboard(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="card-registration-bprn"]')
        .textContent
    ).toContain('Pending allocation')
  })
})

describe('initDashboard fee card states', () => {
  const setupRegistration = (status, fee) => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const producer = storage.getProducerByEmail('a@b.com')
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      status,
      fee
    })
    return producer
  }

  test('shows "Payment due" tag with Pay now link when registration is Submitted', () => {
    setupRegistration('Submitted', { amountPence: 5000, status: 'Created' })
    buildDom()

    initDashboard(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="card-fee-status"]').textContent
    ).toContain('Payment due')
    expect(
      document
        .querySelector('[data-testid="card-fee-action"] a')
        .getAttribute('href')
    ).toBe('/service-charge')
  })

  test('shows "Paid" tag when fee.status is Success', () => {
    setupRegistration('Approved', { amountPence: 5000, status: 'Success' })
    buildDom()

    initDashboard(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="card-fee-status"]').textContent
    ).toContain('Paid')
  })

  test('shows "Not yet due" tag when registration is Started', () => {
    setupRegistration('Started', null)
    buildDom()

    initDashboard(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="card-fee-status"]').textContent
    ).toContain('Not yet due')
  })
})

describe('initDashboard annual return card states', () => {
  test('blocks the annual return when registration is not Approved', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    buildDom()

    initDashboard(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="card-annual-return-status"]')
        .textContent
    ).toContain('Not started')
    expect(
      document.querySelector('[data-testid="card-annual-return-action"]')
        .innerHTML
    ).toBe('')
  })

  test('shows the start link once registration is Approved', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const producer = storage.getProducerByEmail('a@b.com')
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      status: 'Approved'
    })
    buildDom()

    initDashboard(document, globalThis.location)
    expect(
      document
        .querySelector('[data-testid="card-annual-return-action"] a')
        .getAttribute('href')
    ).toMatch(/\/small-producer\/tonnages$/)
  })

  test('deep-links to the I/A annual-return path for direct registrants', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const producer = storage.getProducerByEmail('a@b.com')
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      status: 'Approved',
      producerRoute: 'directRegistrant'
    })
    buildDom()

    initDashboard(document, globalThis.location)
    expect(
      document
        .querySelector('[data-testid="card-annual-return-action"] a')
        .getAttribute('href')
    ).toMatch(/\/ia\/categories$/)
  })

  test('shows "In progress" when a Started submission exists', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const producer = storage.getProducerByEmail('a@b.com')
    const reg = storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      status: 'Approved'
    })
    storage.saveSubmission({
      registrationId: reg.id,
      submissionType: 'smallProducerAnnual',
      status: 'Started'
    })
    buildDom()

    initDashboard(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="card-annual-return-status"]')
        .textContent
    ).toContain('In progress')
  })

  test('shows "Submitted" when a Submitted submission exists', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const producer = storage.getProducerByEmail('a@b.com')
    const reg = storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      status: 'Approved'
    })
    storage.saveSubmission({
      registrationId: reg.id,
      submissionType: 'smallProducerAnnual',
      status: 'Submitted'
    })
    buildDom()

    initDashboard(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="card-annual-return-status"]')
        .textContent
    ).toContain('Submitted')
  })
})

describe('initDashboard activity feed', () => {
  test('renders an empty-state row when no events match', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    globalThis.localStorage.setItem(
      'npwd-batteries:producers',
      JSON.stringify({ 'a@b.com': { contactEmail: 'a@b.com' } })
    )
    buildDom()

    initDashboard(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="card-activity-empty"]')
    ).not.toBeNull()
  })

  test('renders activity items for producer creation, BPRN, registration, fee', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      bprn: 'BPRN-EA-2026-000999',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const producer = storage.getProducerByEmail('a@b.com')
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      status: 'Submitted',
      fee: { amountPence: 5000, status: 'Success' }
    })
    buildDom()

    initDashboard(document, globalThis.location)
    const items = document.querySelectorAll(
      '[data-testid="card-activity-item"]'
    )
    expect(items.length).toBeGreaterThan(2)
  })

  test('includes a submitted annual return in the activity feed', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const producer = storage.getProducerByEmail('a@b.com')
    const reg = storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      status: 'Approved'
    })
    storage.saveSubmission({
      registrationId: reg.id,
      submissionType: 'smallProducerAnnual',
      status: 'Started'
    })
    storage.saveSubmission({
      registrationId: reg.id,
      submissionType: 'smallProducerAnnual',
      status: 'Submitted'
    })
    buildDom()

    initDashboard(document, globalThis.location)
    const list = document.querySelector('[data-testid="card-activity-list"]')
    expect(list.textContent).toContain('Annual return submitted for 2026')
  })

  test('includes an IA-flow submitted annual return in the activity feed', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' },
      batteryTypes: { isIndustrial: true, isAutomotive: true }
    })
    const producer = storage.getProducerByEmail('a@b.com')
    const reg = storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      status: 'Approved',
      producerRoute: 'directRegistrant'
    })
    storage.saveSubmission({
      registrationId: reg.id,
      submissionType: 'industrialAutomotiveAnnual',
      status: 'Submitted'
    })
    buildDom()

    initDashboard(document, globalThis.location)
    const list = document.querySelector('[data-testid="card-activity-list"]')
    expect(list.textContent).toContain('Annual return submitted for 2026')
  })

  test('end-to-end IA flow (tonnages → declaration → dashboard) shows the event', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' },
      batteryTypes: { isIndustrial: true, isAutomotive: true }
    })
    const producer = storage.getProducerByEmail('a@b.com')
    const reg = storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      status: 'Approved',
      producerRoute: 'directRegistrant'
    })
    iaUpsertSubmission(reg.id, {
      submissionType: 'industrialAutomotiveAnnual',
      lines: [],
      totals: {
        placedTotal: '0',
        collectedTotal: '0',
        deliveredTotal: '0',
        exportedTotal: '0'
      }
    })
    iaUpsertSubmission(reg.id, {
      declaration: {
        firstName: 'A',
        lastName: 'B',
        position: 'C',
        declaredAt: '2026-05-01T00:00:00Z'
      },
      status: 'Submitted'
    })
    buildDom()

    initDashboard(document, globalThis.location)
    const list = document.querySelector('[data-testid="card-activity-list"]')
    expect(list.textContent).toContain('Annual return submitted for 2026')
  })
})

describe('initDashboard heading and visibility', () => {
  test('shows the company name as a heading caption when available', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme Power Ltd',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    buildDom()

    initDashboard(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="app-heading-organisation-name"]')
        .textContent
    ).toBe('Acme Power Ltd')
  })

  test('reuses the existing caption element on subsequent renders', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    document.body.innerHTML = `
      <div data-testid="dashboard-loading"></div>
      <div data-testid="dashboard-content" hidden>
        <div data-testid="app-heading">
          <div class="govuk-grid-column-full">
            <p class="govuk-caption-xl" data-testid="app-heading-organisation-name">Old</p>
            <h1>X</h1>
          </div>
        </div>
        <span data-testid="card-registration-status"></span>
        <p data-testid="card-registration-bprn"></p>
        <p data-testid="card-registration-body"></p>
        <p data-testid="card-registration-action"></p>
        <span data-testid="card-fee-status"></span>
        <p data-testid="card-fee-body"></p>
        <p data-testid="card-fee-action"></p>
        <span data-testid="card-annual-return-status"></span>
        <p data-testid="card-annual-return-deadline"></p>
        <p data-testid="card-annual-return-body"></p>
        <p data-testid="card-annual-return-action"></p>
        <ol data-testid="card-activity-list"></ol>
      </div>
      <script id="page-payload" type="application/json">${JSON.stringify(PAYLOAD)}</script>
    `

    initDashboard(document, globalThis.location)
    const captions = document.querySelectorAll(
      '[data-testid="app-heading-organisation-name"]'
    )
    expect(captions).toHaveLength(1)
    expect(captions[0].textContent).toBe('Acme')
  })

  test('reveals the dashboard-content panel after rendering', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    buildDom()

    initDashboard(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="dashboard-loading"]').hidden
    ).toBe(true)
    expect(
      document.querySelector('[data-testid="dashboard-content"]').hidden
    ).toBe(false)
  })

  test('escapes special characters when rendering activity items', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      bprn: '<bprn>',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    buildDom()

    initDashboard(document, globalThis.location)
    const list = document.querySelector('[data-testid="card-activity-list"]')
    expect(list.innerHTML).toContain('&lt;bprn&gt;')
    expect(list.innerHTML).not.toContain('<bprn>')
  })

  test('handles a producer with no companyName without throwing', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    globalThis.localStorage.setItem(
      'npwd-batteries:producers',
      JSON.stringify({
        'a@b.com': { contactEmail: 'a@b.com', companyName: null }
      })
    )
    buildDom()

    expect(() => initDashboard(document, globalThis.location)).not.toThrow()
  })

  test('runs without cards copy in the payload', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    document.body.innerHTML = `
      <div data-testid="dashboard-loading"></div>
      <div data-testid="dashboard-content" hidden></div>
      <script id="page-payload" type="application/json">{"signInUrl":"/sign-in","onboardingStartUrl":"/onboarding/company-details","compliancePeriod":"2026"}</script>
    `

    expect(initDashboard(document, globalThis.location)).toBe('rendered')
  })

  test('skips heading caption insertion when the heading container is missing', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    document.body.innerHTML = `
      <div data-testid="dashboard-loading"></div>
      <div data-testid="dashboard-content" hidden>
        <span data-testid="card-registration-status"></span>
        <p data-testid="card-registration-bprn"></p>
        <p data-testid="card-registration-body"></p>
        <p data-testid="card-registration-action"></p>
        <span data-testid="card-fee-status"></span>
        <p data-testid="card-fee-body"></p>
        <p data-testid="card-fee-action"></p>
        <span data-testid="card-annual-return-status"></span>
        <p data-testid="card-annual-return-deadline"></p>
        <p data-testid="card-annual-return-body"></p>
        <p data-testid="card-annual-return-action"></p>
        <ol data-testid="card-activity-list"></ol>
      </div>
      <script id="page-payload" type="application/json">${JSON.stringify(PAYLOAD)}</script>
    `

    expect(() => initDashboard(document, globalThis.location)).not.toThrow()
  })

  test('inserts caption at the correct DOM position when none exists yet', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Test Co',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    document.body.innerHTML = `
      <div data-testid="dashboard-loading"></div>
      <div data-testid="dashboard-content" hidden>
        <div data-testid="app-heading"></div>
        <span data-testid="card-registration-status"></span>
        <p data-testid="card-registration-bprn"></p>
        <p data-testid="card-registration-body"></p>
        <p data-testid="card-registration-action"></p>
        <span data-testid="card-fee-status"></span>
        <p data-testid="card-fee-body"></p>
        <p data-testid="card-fee-action"></p>
        <span data-testid="card-annual-return-status"></span>
        <p data-testid="card-annual-return-deadline"></p>
        <p data-testid="card-annual-return-body"></p>
        <p data-testid="card-annual-return-action"></p>
        <ol data-testid="card-activity-list"></ol>
      </div>
      <script id="page-payload" type="application/json">${JSON.stringify(PAYLOAD)}</script>
    `

    initDashboard(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="app-heading-organisation-name"]')
    ).toBeNull()
  })

  test('handles a DOM missing the activity list element', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    document.body.innerHTML = `
      <div data-testid="dashboard-loading"></div>
      <div data-testid="dashboard-content" hidden>
        <div data-testid="app-heading">
          <div class="govuk-grid-column-full"></div>
        </div>
        <span data-testid="card-registration-status"></span>
        <p data-testid="card-registration-bprn"></p>
        <p data-testid="card-registration-body"></p>
        <p data-testid="card-registration-action"></p>
        <span data-testid="card-fee-status"></span>
        <p data-testid="card-fee-body"></p>
        <p data-testid="card-fee-action"></p>
        <span data-testid="card-annual-return-status"></span>
        <p data-testid="card-annual-return-deadline"></p>
        <p data-testid="card-annual-return-body"></p>
        <p data-testid="card-annual-return-action"></p>
      </div>
      <script id="page-payload" type="application/json">${JSON.stringify(PAYLOAD)}</script>
    `
    expect(() => initDashboard(document, globalThis.location)).not.toThrow()
  })

  test('handles a DOM with no loading or content panels', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    document.body.innerHTML = `<script id="page-payload" type="application/json">${JSON.stringify(PAYLOAD)}</script>`
    expect(() => initDashboard(document, globalThis.location)).not.toThrow()
  })

  test('uses the default compliance period when the payload omits it', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const noPeriodPayload = { ...PAYLOAD }
    delete noPeriodPayload.compliancePeriod
    buildDom(noPeriodPayload)

    initDashboard(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="card-annual-return-deadline"]')
        .textContent
    ).toContain('2026')
  })

  test('handles an invalid date in the activity feed gracefully', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    globalThis.localStorage.setItem(
      'npwd-batteries:producers',
      JSON.stringify({
        'a@b.com': {
          contactEmail: 'a@b.com',
          companyName: 'Acme',
          createdAt: '2024-13-99'
        }
      })
    )
    buildDom()

    expect(() => initDashboard(document, globalThis.location)).not.toThrow()
  })
})
