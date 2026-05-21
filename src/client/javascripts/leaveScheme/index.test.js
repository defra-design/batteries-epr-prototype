// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runLeaveSchemeStep } from './index.js'
import { storage } from '../storage-adapter.js'

const DRAFT_KEY = 'npwd-batteries:leave-scheme-draft'

const seedSchemeProducer = ({
  bprn = 'BPRN-EA-2026-077001',
  compliancePeriod = '2026',
  status = 'Submitted'
} = {}) => {
  storage.setCurrentUser({ email: 'leaver@x.com' })
  storage.saveProducer({
    contactEmail: 'leaver@x.com',
    companyName: 'Leaver Co',
    bprn,
    agencyCode: 'EA',
    registeredAddress: { postcode: 'M1 4AA' },
    status: 'Approved'
  })
  const producer = storage.getProducerByEmail('leaver@x.com')
  const scheme = storage.saveScheme({ name: 'Leave Scheme' })
  storage.saveRegistration({
    producerId: producer.id,
    compliancePeriod,
    producerRoute: 'complianceScheme',
    schemeId: scheme.id,
    status
  })
  storage.joinScheme({
    producerBprn: bprn,
    producerEmail: 'leaver@x.com',
    schemeId: scheme.id,
    compliancePeriod,
    status: 'active'
  })
  return { producer, scheme }
}

const installPayload = (payload, html = '') => {
  document.body.innerHTML =
    html +
    `<script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>`
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

describe('runLeaveSchemeStep — auth and producer gates', () => {
  test('redirects to sign-in when not authenticated', () => {
    installPayload({ step: 'leaveSchemeReason', target: 'hydrate' })
    expect(runLeaveSchemeStep(document, globalThis.location)).toBe(false)
    expect(assignSpy).toHaveBeenCalledWith('/sign-in')
  })

  test('redirects to /account when there is no producer record', () => {
    storage.setCurrentUser({ email: 'ghost@x.com' })
    installPayload({ step: 'leaveSchemeReason', target: 'hydrate' })
    expect(runLeaveSchemeStep(document, globalThis.location)).toBe(
      'redirected-to-account'
    )
    expect(assignSpy).toHaveBeenCalledWith('/account')
  })
})

describe('runLeaveSchemeStep — re-entry guard', () => {
  test('redirects to /account when registration is not on the scheme route', () => {
    storage.setCurrentUser({ email: 'direct@x.com' })
    storage.saveProducer({
      contactEmail: 'direct@x.com',
      companyName: 'Direct Co',
      bprn: 'BPRN-EA-2026-077999',
      agencyCode: 'EA',
      status: 'Approved'
    })
    const producer = storage.getProducerByEmail('direct@x.com')
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      producerRoute: 'smallProducer',
      status: 'Submitted'
    })

    installPayload({ step: 'leaveSchemeReason', target: 'hydrate' })
    expect(runLeaveSchemeStep(document, globalThis.location)).toBe(
      'redirected-not-member'
    )
    expect(assignSpy).toHaveBeenCalledWith('/account')
  })
})

describe('runLeaveSchemeStep — reason step', () => {
  test('hydrate target returns "hydrated" without writing draft', () => {
    seedSchemeProducer()
    installPayload({ step: 'leaveSchemeReason', target: 'hydrate' })
    expect(runLeaveSchemeStep(document, globalThis.location)).toBe('hydrated')
    expect(globalThis.localStorage.getItem(DRAFT_KEY)).toBeNull()
  })

  test('saveDraft target writes draft to localStorage and navigates', () => {
    seedSchemeProducer()
    installPayload({
      step: 'leaveSchemeReason',
      target: 'saveDraft',
      savedFields: { reasonForLeaving: 'belowThreshold', otherReason: '' },
      nextStep: '/leave-scheme/declaration'
    })
    expect(runLeaveSchemeStep(document, globalThis.location)).toBe('navigated')
    expect(assignSpy).toHaveBeenCalledWith('/leave-scheme/declaration')
    const draft = JSON.parse(globalThis.localStorage.getItem(DRAFT_KEY))
    expect(draft.reasonForLeaving).toBe('belowThreshold')
  })
})

describe('runLeaveSchemeStep — declaration step', () => {
  test('hydrate populates the reason summary from the draft', () => {
    seedSchemeProducer()
    globalThis.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ reasonForLeaving: 'belowThreshold', otherReason: '' })
    )
    installPayload(
      { step: 'leaveSchemeDeclaration', target: 'hydrate' },
      '<dd data-testid="leave-scheme-summary-reason">—</dd>'
    )
    expect(runLeaveSchemeStep(document, globalThis.location)).toBe('hydrated')
    expect(
      document.querySelector('[data-testid="leave-scheme-summary-reason"]')
        .textContent
    ).toBe('belowThreshold')
  })

  test('hydrate uses otherReason text for the "other" reason', () => {
    seedSchemeProducer()
    globalThis.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        reasonForLeaving: 'other',
        otherReason: 'Closing UK arm'
      })
    )
    installPayload(
      { step: 'leaveSchemeDeclaration', target: 'hydrate' },
      '<dd data-testid="leave-scheme-summary-reason">—</dd>'
    )
    runLeaveSchemeStep(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="leave-scheme-summary-reason"]')
        .textContent
    ).toBe('Closing UK arm')
  })

  test('hydrate falls back to "Other" when otherReason text is blank', () => {
    seedSchemeProducer()
    globalThis.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ reasonForLeaving: 'other', otherReason: '' })
    )
    installPayload(
      { step: 'leaveSchemeDeclaration', target: 'hydrate' },
      '<dd data-testid="leave-scheme-summary-reason">—</dd>'
    )
    runLeaveSchemeStep(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="leave-scheme-summary-reason"]')
        .textContent
    ).toBe('Other')
  })

  test('hydrate redirects back to reason when no draft is present', () => {
    seedSchemeProducer()
    installPayload({ step: 'leaveSchemeDeclaration', target: 'hydrate' })
    expect(runLeaveSchemeStep(document, globalThis.location)).toBe(
      'redirected-no-draft'
    )
    expect(assignSpy).toHaveBeenCalledWith('/leave-scheme/reason')
  })

  test('hydrate does nothing observable when the summary element is missing', () => {
    seedSchemeProducer()
    globalThis.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ reasonForLeaving: 'ceasedTrading', otherReason: '' })
    )
    installPayload({ step: 'leaveSchemeDeclaration', target: 'hydrate' })
    expect(runLeaveSchemeStep(document, globalThis.location)).toBe('hydrated')
  })

  test('transition target runs the storage transition, clears the draft, and navigates', () => {
    const { producer } = seedSchemeProducer()
    globalThis.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ reasonForLeaving: 'belowThreshold', otherReason: '' })
    )
    installPayload({
      step: 'leaveSchemeDeclaration',
      target: 'transition',
      nextStep: '/leave-scheme/confirmation'
    })
    expect(runLeaveSchemeStep(document, globalThis.location)).toBe('navigated')
    expect(assignSpy).toHaveBeenCalledWith('/leave-scheme/confirmation')
    expect(globalThis.localStorage.getItem(DRAFT_KEY)).toBeNull()
    const registrations = storage.listRegistrationsForProducer(producer.id)
    expect(
      registrations.some((r) => r.producerRoute === 'directRegistrant')
    ).toBe(true)
  })

  test('transition target redirects to reason if draft is missing', () => {
    seedSchemeProducer()
    installPayload({
      step: 'leaveSchemeDeclaration',
      target: 'transition',
      nextStep: '/leave-scheme/confirmation'
    })
    expect(runLeaveSchemeStep(document, globalThis.location)).toBe(
      'redirected-no-draft'
    )
    expect(assignSpy).toHaveBeenCalledWith('/leave-scheme/reason')
  })

  test('hydrate recovers when the localStorage draft JSON is unparseable', () => {
    seedSchemeProducer()
    globalThis.localStorage.setItem(DRAFT_KEY, '{not json')
    installPayload({ step: 'leaveSchemeDeclaration', target: 'hydrate' })
    expect(runLeaveSchemeStep(document, globalThis.location)).toBe(
      'redirected-no-draft'
    )
  })
})

describe('runLeaveSchemeStep — confirmation step', () => {
  test('hydrates the BPRN from the producer record', () => {
    storage.setCurrentUser({ email: 'leaver@x.com' })
    storage.saveProducer({
      contactEmail: 'leaver@x.com',
      companyName: 'Leaver Co',
      bprn: 'BPRN-EA-2026-077777',
      status: 'Approved'
    })

    installPayload(
      { step: 'leaveSchemeConfirmation', target: 'hydrate' },
      '<span data-testid="leave-scheme-bprn">…</span>'
    )
    expect(runLeaveSchemeStep(document, globalThis.location)).toBe(
      'confirmation'
    )
    expect(
      document.querySelector('[data-testid="leave-scheme-bprn"]').textContent
    ).toBe('BPRN-EA-2026-077777')
  })

  test('renders blank bprn when producer has none yet', () => {
    storage.setCurrentUser({ email: 'leaver@x.com' })
    storage.saveProducer({
      contactEmail: 'leaver@x.com',
      companyName: 'Leaver Co',
      status: 'Started'
    })

    installPayload(
      { step: 'leaveSchemeConfirmation', target: 'hydrate' },
      '<span data-testid="leave-scheme-bprn">…</span>'
    )
    runLeaveSchemeStep(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="leave-scheme-bprn"]').textContent
    ).toBe('')
  })

  test('confirmation step skips the re-entry guard even after transition', () => {
    storage.setCurrentUser({ email: 'leaver@x.com' })
    storage.saveProducer({
      contactEmail: 'leaver@x.com',
      companyName: 'Leaver Co',
      bprn: 'BPRN-EA-2026-077888',
      status: 'Approved'
    })
    const producer = storage.getProducerByEmail('leaver@x.com')
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      producerRoute: 'directRegistrant',
      status: 'Submitted'
    })

    installPayload(
      { step: 'leaveSchemeConfirmation', target: 'hydrate' },
      '<span data-testid="leave-scheme-bprn">…</span>'
    )
    expect(runLeaveSchemeStep(document, globalThis.location)).toBe(
      'confirmation'
    )
  })

  test('confirmation step is tolerant of a missing bprn placeholder element', () => {
    storage.setCurrentUser({ email: 'leaver@x.com' })
    storage.saveProducer({
      contactEmail: 'leaver@x.com',
      companyName: 'Leaver Co',
      bprn: 'BPRN-EA-2026-077889',
      status: 'Approved'
    })
    installPayload({ step: 'leaveSchemeConfirmation', target: 'hydrate' })
    expect(runLeaveSchemeStep(document, globalThis.location)).toBe(
      'confirmation'
    )
  })
})
