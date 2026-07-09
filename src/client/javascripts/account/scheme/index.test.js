// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { renderAccountScheme } from './index.js'
import { storage } from '../../storage-adapter.js'

const LABELS = {
  notFoundName: 'Scheme record unavailable',
  timelineJoined: 'Joined',
  timelineLeft: 'Left',
  timelineActive: 'current',
  timelineReason: 'Reason'
}

const buildDom = () => {
  document.body.innerHTML = `
    <div data-testid="account-scheme-loading"></div>
    <div data-testid="account-scheme-not-member" hidden></div>
    <div data-testid="account-scheme-content" hidden>
      <dd data-testid="account-scheme-name"></dd>
      <dd data-testid="account-scheme-operator"></dd>
      <dd data-testid="account-scheme-approval-number"></dd>
      <dd data-testid="account-scheme-contact-email"></dd>
      <dd data-testid="account-scheme-web-address"></dd>
      <ol data-testid="account-scheme-timeline"></ol>
      <p data-testid="account-scheme-timeline-empty" hidden></p>
    </div>
    <script id="page-payload" type="application/json">${JSON.stringify({
      signInUrl: '/sign-in',
      accountUrl: '/account',
      compliancePeriod: '2026',
      labels: LABELS
    })}</script>
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

const seedSchemeProducer = ({
  bprn = 'BPRN-EA-2026-000001',
  companyName = 'Acme Ltd'
} = {}) => {
  storage.setCurrentUser({ email: 'a@b.com' })
  storage.saveProducer({
    contactEmail: 'a@b.com',
    companyName,
    bprn,
    registeredAddress: { postcode: 'M1 4AA' }
  })
  const producer = storage.getProducerByEmail('a@b.com')
  const scheme = storage.saveScheme({
    name: 'Northern Battery Compliance Scheme',
    operator: 'NBCS Ltd',
    approvalNumber: 'BCS/2026/001',
    contactEmail: 'ops@nbcs.test',
    webAddress: 'https://nbcs.test'
  })
  storage.saveRegistration({
    producerId: producer.id,
    compliancePeriod: '2026',
    producerRoute: 'complianceScheme',
    schemeId: scheme.id
  })
  return { producer, scheme }
}

describe('renderAccountScheme', () => {
  test('redirects to sign-in when not authenticated', () => {
    buildDom()
    expect(renderAccountScheme(document, globalThis.location)).toBe(false)
    expect(assignSpy).toHaveBeenCalledWith('/sign-in')
  })

  test('redirects to /account when there is no producer record', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    buildDom()
    expect(renderAccountScheme(document, globalThis.location)).toBe(
      'redirected-to-account'
    )
    expect(assignSpy).toHaveBeenCalledWith('/account')
  })

  test('shows the not-member section when registration is not on the scheme route', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const producer = storage.getProducerByEmail('a@b.com')
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      producerRoute: 'smallProducer'
    })

    buildDom()
    expect(renderAccountScheme(document, globalThis.location)).toBe(
      'not-member'
    )
    expect(
      document.querySelector('[data-testid="account-scheme-not-member"]').hidden
    ).toBe(false)
    expect(
      document.querySelector('[data-testid="account-scheme-content"]').hidden
    ).toBe(true)
  })

  test('renders scheme details when registration is on the scheme route', () => {
    seedSchemeProducer()
    buildDom()
    expect(renderAccountScheme(document, globalThis.location)).toBe('rendered')
    expect(
      document.querySelector('[data-testid="account-scheme-name"]').textContent
    ).toBe('Northern Battery Compliance Scheme')
    expect(
      document.querySelector('[data-testid="account-scheme-operator"]')
        .textContent
    ).toBe('NBCS Ltd')
    expect(
      document.querySelector('[data-testid="account-scheme-approval-number"]')
        .textContent
    ).toBe('BCS/2026/001')
  })

  test('renders an empty-state message when the producer has no membership history', () => {
    seedSchemeProducer()
    buildDom()
    renderAccountScheme(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="account-scheme-timeline-empty"]')
        .hidden
    ).toBe(false)
  })

  test('renders a membership timeline with current and historic rows', () => {
    const { producer, scheme } = seedSchemeProducer()
    storage.saveSchemeMember({
      producerBprn: producer.bprn,
      schemeId: scheme.id,
      companyName: producer.companyName,
      compliancePeriod: '2025',
      joinedOn: '2025-02-01T00:00:00Z',
      leftOn: '2025-12-31T00:00:00Z',
      reasonForLeaving: 'switching-scheme'
    })
    storage.saveSchemeMember({
      producerBprn: producer.bprn,
      schemeId: scheme.id,
      companyName: producer.companyName,
      compliancePeriod: '2026',
      joinedOn: '2026-02-01T00:00:00Z'
    })

    buildDom()
    renderAccountScheme(document, globalThis.location)
    const rows = document.querySelectorAll(
      '[data-testid="account-scheme-timeline-row"]'
    )
    expect(rows).toHaveLength(2)
    expect(rows[0].textContent).toContain('current')
    expect(rows[1].textContent).toContain('switching-scheme')
  })

  test('falls back to a placeholder name when the scheme record is missing', () => {
    seedSchemeProducer()
    storage.saveSchemeMember({
      producerBprn: 'BPRN-EA-2026-000001',
      schemeId: 'no-such-scheme',
      compliancePeriod: '2026',
      joinedOn: '2026-02-01T00:00:00Z'
    })

    buildDom()
    renderAccountScheme(document, globalThis.location)
    const rows = document.querySelectorAll(
      '[data-testid="account-scheme-timeline-row"]'
    )
    expect(rows[0].textContent).toContain('Scheme record unavailable')
  })

  test('handles a scheme route registration without a schemeId without throwing', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      bprn: 'BPRN-EA-2026-000099',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const producer = storage.getProducerByEmail('a@b.com')
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      producerRoute: 'complianceScheme'
    })

    buildDom()
    expect(renderAccountScheme(document, globalThis.location)).toBe('rendered')
    expect(
      document.querySelector('[data-testid="account-scheme-name"]').textContent
    ).toBe('—')
  })

  test('uses default compliance period and signInUrl when payload missing', () => {
    document.body.innerHTML = `<div data-testid="account-scheme-loading"></div>`
    expect(renderAccountScheme(document, globalThis.location)).toBe(false)
    expect(assignSpy).toHaveBeenCalledWith('/sign-in')
  })

  test('pendingScheme producer without a bprn does not crash and shows empty timeline', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const producer = storage.getProducerByEmail('a@b.com')
    const scheme = storage.saveScheme({ name: 'Some Scheme' })
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      producerRoute: 'complianceScheme',
      schemeId: scheme.id,
      status: 'pendingScheme'
    })

    buildDom()
    expect(renderAccountScheme(document, globalThis.location)).toBe('rendered')
    expect(
      document.querySelector('[data-testid="account-scheme-timeline-empty"]')
        .hidden
    ).toBe(false)
  })
})
