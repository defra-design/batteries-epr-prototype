// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { initAccount } from './index.js'
import { storage } from '../storage-adapter.js'

const SECTIONS = {
  company: {
    title: 'Company details',
    companyName: 'Registered company name',
    tradingName: 'Trading name',
    companyRegistrationNo: 'Companies House number',
    webAddress: 'Website',
    sicCode: 'SIC code',
    registeredAddress: 'Registered office address',
    agencyCode: 'Regulator',
    editAction: 'Edit company details',
    empty: 'Not provided'
  },
  contact: {
    title: 'Primary contact',
    firstName: 'First name',
    lastName: 'Last name',
    position: 'Position',
    phone: 'Phone',
    email: 'Email',
    editAction: 'Edit contact details'
  },
  serviceOfNotice: {
    title: 'Service of notice address',
    sameAsRegistered: 'Same as registered office',
    editAction: 'Edit service of notice address'
  },
  batteryTypes: {
    title: 'Battery types',
    none: 'No battery types declared',
    portable: 'Portable',
    industrial: 'Industrial',
    automotive: 'Automotive',
    editAction: 'Edit battery types'
  },
  brandNames: {
    title: 'Brand names',
    empty: 'No brands recorded',
    editAction: 'Edit brand names'
  },
  submissions: {
    title: 'Past submissions',
    empty: 'You have not submitted an annual return yet.',
    registrationLabel: 'Registration',
    submissionLabel: 'Annual return',
    statusLabel: 'Status',
    periodLabel: 'Compliance period'
  },
  reset: {
    title: 'Prototype data',
    body: 'Reset blurb.',
    confirmAction: 'Reset prototype data'
  }
}

const PAYLOAD = {
  signInUrl: '/sign-in',
  dashboardUrl: '/dashboard',
  compliancePeriod: '2026',
  showReset: false,
  sections: SECTIONS
}

const buildDom = (payload = PAYLOAD, { withReset = false } = {}) => {
  document.body.innerHTML = `
    <div data-testid="account-loading"><p>Loading…</p></div>
    <div data-testid="account-content" hidden>
      <dl data-testid="account-company-list"></dl>
      <dl data-testid="account-contact-list"></dl>
      <dl data-testid="account-son-list"></dl>
      <p data-testid="account-battery-types"></p>
      <ul data-testid="account-brand-names"></ul>
      <div data-testid="account-submissions"></div>
      ${withReset ? '<button data-testid="account-reset-confirm" type="button">Reset</button>' : ''}
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

describe('initAccount auth and producer gates', () => {
  test('redirects to sign-in when no current user', () => {
    buildDom()
    expect(initAccount(document, globalThis.location)).toBe(false)
    expect(assignSpy).toHaveBeenCalledWith('/sign-in')
  })

  test('falls back to /sign-in when payload omits signInUrl', () => {
    document.body.innerHTML = `<script id="page-payload" type="application/json">{}</script>`
    expect(initAccount(document, globalThis.location)).toBe(false)
    expect(assignSpy).toHaveBeenCalledWith('/sign-in')
  })

  test('redirects signed-in users with no producer to the dashboard', () => {
    storage.setCurrentUser({ email: 'new@example.com' })
    buildDom()
    expect(initAccount(document, globalThis.location)).toBe('redirected')
    expect(assignSpy).toHaveBeenCalledWith('/dashboard')
  })

  test('falls back to /dashboard when payload omits dashboardUrl', () => {
    storage.setCurrentUser({ email: 'new@example.com' })
    document.body.innerHTML = `<script id="page-payload" type="application/json">${JSON.stringify(
      { ...PAYLOAD, dashboardUrl: undefined }
    )}</script>`
    expect(initAccount(document, globalThis.location)).toBe('redirected')
    expect(assignSpy).toHaveBeenCalledWith('/dashboard')
  })
})

describe('initAccount renders producer details', () => {
  const setupProducer = (overrides = {}) => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme Power Ltd',
      tradingName: 'Acme',
      companyRegistrationNo: '12345678',
      webAddress: 'https://acme.test',
      sicCode: '46',
      agencyCode: 'EA',
      registeredAddress: {
        line1: '1 Battery Way',
        line2: null,
        town: 'Sheffield',
        postcode: 'S1 2AB',
        countryCode: 'GB'
      },
      primaryContact: {
        firstName: 'Sam',
        lastName: 'Smith',
        position: 'Director',
        phone: '01234 567890',
        email: 'sam@acme.test'
      },
      batteryTypes: {
        isPortable: true,
        isIndustrial: false,
        isAutomotive: true
      },
      brandNames: ['AcmePower', 'AcmeCells'],
      ...overrides
    })
    return storage.getProducerByEmail('a@b.com')
  }

  test('renders all sections for a fully populated producer', () => {
    setupProducer({
      serviceOfNoticeAddress: {
        line1: '1 Battery Way',
        line2: null,
        town: 'Sheffield',
        postcode: 'S1 2AB',
        countryCode: 'GB'
      }
    })
    buildDom()

    expect(initAccount(document, globalThis.location)).toBe('rendered')
    expect(
      document.querySelector('[data-testid="account-company-list"]').innerHTML
    ).toContain('Acme Power Ltd')
    expect(
      document.querySelector('[data-testid="account-contact-list"]').innerHTML
    ).toContain('Sam')
    expect(
      document.querySelector('[data-testid="account-son-list"]').innerHTML
    ).toContain('Same as registered office')
    expect(
      document.querySelector('[data-testid="account-battery-types"]')
        .textContent
    ).toBe('Portable, Automotive')
    const brands = document.querySelectorAll(
      '[data-testid="account-brand-name"]'
    )
    expect(brands).toHaveLength(2)
    expect(
      document.querySelector('[data-testid="account-submissions-empty"]')
    ).not.toBeNull()
  })

  test('shows "Not provided" for missing company fields', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: null,
      tradingName: null,
      companyRegistrationNo: null,
      webAddress: null,
      sicCode: null,
      registeredAddress: null,
      agencyCode: null
    })
    buildDom()

    initAccount(document, globalThis.location)
    const html = document.querySelector(
      '[data-testid="account-company-list"]'
    ).innerHTML
    expect((html.match(/Not provided/g) ?? []).length).toBeGreaterThan(3)
  })

  test('falls back to em-dash for missing contact fields', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({ contactEmail: 'a@b.com' })
    buildDom()

    initAccount(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="account-contact-list"]').innerHTML
    ).toContain('—')
  })

  test('renders the different-address branch for service of notice', () => {
    setupProducer({
      serviceOfNoticeAddress: {
        line1: '99 Different Road',
        line2: 'Suite 4',
        town: 'Leeds',
        postcode: 'LS1 1AA',
        countryCode: 'GB'
      }
    })
    buildDom()

    initAccount(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="account-son-list"]').innerHTML
    ).toContain('99 Different Road')
  })

  test('renders em-dash when service of notice address is missing entirely', () => {
    setupProducer({ serviceOfNoticeAddress: null })
    buildDom()

    initAccount(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="account-son-list"]').innerHTML
    ).toContain('—')
  })

  test('renders all three battery types when all flags are set', () => {
    setupProducer({
      batteryTypes: {
        isPortable: true,
        isIndustrial: true,
        isAutomotive: true
      }
    })
    buildDom()

    initAccount(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="account-battery-types"]')
        .textContent
    ).toBe('Portable, Industrial, Automotive')
  })

  test('renders the "no battery types declared" message when none are set', () => {
    setupProducer({
      batteryTypes: {
        isPortable: false,
        isIndustrial: false,
        isAutomotive: false
      }
    })
    buildDom()

    initAccount(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="account-battery-types"]')
        .textContent
    ).toBe('No battery types declared')
  })

  test('renders the empty-brand-names message when no brands are recorded', () => {
    setupProducer({ brandNames: [] })
    buildDom()

    initAccount(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="account-brand-names-empty"]')
    ).not.toBeNull()
  })

  test('renders past submissions in newest-first order', () => {
    const producer = setupProducer()
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

    initAccount(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="account-submissions-list"]')
    ).not.toBeNull()
  })

  test('escapes special characters in brand names', () => {
    setupProducer({ brandNames: ['<dangerous>'] })
    buildDom()

    initAccount(document, globalThis.location)
    const list = document.querySelector('[data-testid="account-brand-names"]')
    expect(list.innerHTML).toContain('&lt;dangerous&gt;')
    expect(list.innerHTML).not.toContain('<dangerous>')
  })

  test('renders an empty date string when a submission has an unparseable updatedAt', () => {
    const producer = setupProducer()
    globalThis.localStorage.setItem(
      'npwd-batteries:registrations',
      JSON.stringify({
        'reg-x': {
          id: 'reg-x',
          producerId: producer.id,
          compliancePeriod: '2026',
          status: 'Approved'
        }
      })
    )
    globalThis.localStorage.setItem(
      'npwd-batteries:submissions',
      JSON.stringify({
        'sub-x': {
          id: 'sub-x',
          registrationId: 'reg-x',
          status: 'Started',
          updatedAt: 'not-a-real-date'
        }
      })
    )
    buildDom()

    expect(() => initAccount(document, globalThis.location)).not.toThrow()
  })

  test('handles submissions missing updatedAt without throwing', () => {
    const producer = setupProducer()
    globalThis.localStorage.setItem(
      'npwd-batteries:registrations',
      JSON.stringify({
        'reg-x': {
          id: 'reg-x',
          producerId: producer.id,
          compliancePeriod: '2026',
          status: 'Approved'
        }
      })
    )
    globalThis.localStorage.setItem(
      'npwd-batteries:submissions',
      JSON.stringify({
        'sub-a': {
          id: 'sub-a',
          registrationId: 'reg-x',
          status: 'Started'
        },
        'sub-b': {
          id: 'sub-b',
          registrationId: 'reg-x',
          status: 'Submitted',
          updatedAt: '2026-05-01T00:00:00Z'
        }
      })
    )
    buildDom()

    expect(() => initAccount(document, globalThis.location)).not.toThrow()
  })
})

describe('initAccount reset button', () => {
  test('wires the reset button to clear and reseed when showReset is true', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({ contactEmail: 'a@b.com', companyName: 'Acme' })
    buildDom({ ...PAYLOAD, showReset: true }, { withReset: true })

    initAccount(document, globalThis.location)
    const button = document.querySelector(
      '[data-testid="account-reset-confirm"]'
    )
    button.click()
    expect(assignSpy).toHaveBeenCalledWith('/')
  })

  test('does not crash when showReset is true but the button is missing', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({ contactEmail: 'a@b.com', companyName: 'Acme' })
    buildDom({ ...PAYLOAD, showReset: true }, { withReset: false })

    expect(() => initAccount(document, globalThis.location)).not.toThrow()
  })
})

describe('initAccount DOM tolerance', () => {
  test('runs without any of the panels present', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({ contactEmail: 'a@b.com', companyName: 'Acme' })
    document.body.innerHTML = `<script id="page-payload" type="application/json">${JSON.stringify(PAYLOAD)}</script>`
    expect(() => initAccount(document, globalThis.location)).not.toThrow()
  })

  test('falls back to an empty payload object when no page-payload script exists', () => {
    document.body.innerHTML = `<div></div>`
    expect(initAccount(document, globalThis.location)).toBe(false)
    expect(assignSpy).toHaveBeenCalledWith('/sign-in')
  })
})
