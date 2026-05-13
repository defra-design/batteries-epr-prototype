// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runOnboardingStep } from './wizard-step.js'
import { storage } from '../storage-adapter.js'

const installPayload = (payload) => {
  document.body.innerHTML = `<form><input name="companyName" /><input name="line1" /></form><script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>`
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
  storage.setCurrentUser({ email: 'wizard@example.com' })
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('runOnboardingStep — persist branch', () => {
  test('producer target writes to storage and navigates', () => {
    installPayload({
      step: 'companyDetails',
      target: 'producer',
      compliancePeriod: '2026',
      savedFields: {
        companyName: 'Acme',
        registeredAddress: { line1: '1', town: 'X', postcode: 'M1 4AA' }
      },
      nextStep: '/onboarding/contact-details'
    })

    expect(runOnboardingStep(document, globalThis.location)).toBe('navigated')
    expect(assignSpy).toHaveBeenCalledWith('/onboarding/contact-details')
    expect(storage.getProducerByEmail('wizard@example.com').companyName).toBe(
      'Acme'
    )
  })

  test('registration target writes registration', () => {
    storage.saveProducer({
      contactEmail: 'wizard@example.com',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    installPayload({
      step: 'producerRoute',
      target: 'registration',
      compliancePeriod: '2026',
      savedFields: { producerRoute: 'smallProducer' },
      nextStep: '/onboarding/declaration'
    })

    expect(runOnboardingStep(document, globalThis.location)).toBe('navigated')
    const producer = storage.getProducerByEmail('wizard@example.com')
    const list = storage.listRegistrationsForProducer(producer.id)
    expect(list[0].producerRoute).toBe('smallProducer')
  })

  test('registration-and-submit target persists and submits', () => {
    storage.saveProducer({
      contactEmail: 'wizard@example.com',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    installPayload({
      step: 'declaration',
      target: 'registration-and-submit',
      compliancePeriod: '2026',
      savedFields: {
        declaration: {
          firstName: 'A',
          lastName: 'B',
          position: 'C',
          declaredAt: '2026-04-30T00:00:00Z'
        }
      },
      nextStep: '/onboarding/confirmation'
    })

    expect(runOnboardingStep(document, globalThis.location)).toBe('navigated')
    const producer = storage.getProducerByEmail('wizard@example.com')
    expect(producer.bprn).toMatch(/^BPRN-/)
  })

  test('submit target only submits without persisting fields', () => {
    storage.saveProducer({
      contactEmail: 'wizard@example.com',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    installPayload({
      step: 'submit',
      target: 'submit',
      compliancePeriod: '2026',
      nextStep: '/dashboard'
    })

    expect(runOnboardingStep(document, globalThis.location)).toBe('navigated')
    expect(storage.getProducerByEmail('wizard@example.com').bprn).toMatch(
      /^BPRN-/
    )
  })

  test('persisted with no nextStep returns "persisted"', () => {
    installPayload({
      step: 'companyDetails',
      target: 'producer',
      compliancePeriod: '2026',
      savedFields: { companyName: 'X' }
    })
    expect(runOnboardingStep(document, globalThis.location)).toBe('persisted')
    expect(assignSpy).not.toHaveBeenCalled()
  })
})

describe('runOnboardingStep — hydrate branch', () => {
  test('returns "hydrated" and prefills the form from storage', () => {
    storage.saveProducer({
      contactEmail: 'wizard@example.com',
      companyName: 'Acme',
      registeredAddress: { line1: '1 Way', postcode: 'M1 4AA' }
    })
    installPayload({
      step: 'companyDetails',
      target: 'hydrate',
      compliancePeriod: '2026'
    })

    expect(runOnboardingStep(document, globalThis.location)).toBe('hydrated')
    expect(document.querySelector('[name="companyName"]').value).toBe('Acme')
    expect(document.querySelector('[name="line1"]').value).toBe('1 Way')
  })

  test('runs without a form silently', () => {
    storage.saveProducer({
      contactEmail: 'wizard@example.com',
      companyName: 'Acme'
    })
    document.body.innerHTML = `<script id="page-payload" type="application/json">${JSON.stringify({ step: 'companyDetails', target: 'hydrate', compliancePeriod: '2026' })}</script>`

    expect(runOnboardingStep(document, globalThis.location)).toBe('hydrated')
  })
})

describe('runOnboardingStep — auth gate', () => {
  test('returns false and redirects when not signed in', () => {
    storage.signOut()
    installPayload({
      step: 'companyDetails',
      target: 'hydrate',
      compliancePeriod: '2026'
    })
    expect(runOnboardingStep(document, globalThis.location)).toBe(false)
    expect(assignSpy).toHaveBeenCalledWith('/sign-in')
  })
})

describe('runOnboardingStep — payload fallbacks', () => {
  test('uses default compliance period when no page-payload present', () => {
    storage.saveProducer({
      contactEmail: 'wizard@example.com',
      companyName: 'Acme'
    })
    document.body.innerHTML = `<form><input name="companyName" /></form>`
    expect(runOnboardingStep(document, globalThis.location)).toBe('hydrated')
    expect(document.querySelector('[name="companyName"]').value).toBe('Acme')
  })
})

describe('runOnboardingStep — skipHydration', () => {
  test('preserves server-rendered values when skipHydration is set', () => {
    storage.saveProducer({
      contactEmail: 'wizard@example.com',
      companyName: 'Stored Co'
    })
    document.body.innerHTML = `
      <form><input name="companyName" value="Just Typed By User" /></form>
      <script id="page-payload" type="application/json">${JSON.stringify({
        step: 'companyDetails',
        target: 'hydrate',
        compliancePeriod: '2026',
        skipHydration: true
      })}</script>
    `

    expect(runOnboardingStep(document, globalThis.location)).toBe('preserved')
    expect(document.querySelector('[name="companyName"]').value).toBe(
      'Just Typed By User'
    )
  })
})

describe('runOnboardingStep — producer-route gate edge cases', () => {
  test('handles a producer-route page with no radios at all', () => {
    storage.saveProducer({
      contactEmail: 'wizard@example.com',
      batteryTypes: {
        isPortable: false,
        isIndustrial: true,
        isAutomotive: false
      }
    })
    document.body.innerHTML = `<script id="page-payload" type="application/json">${JSON.stringify({ step: 'producerRoute', target: 'hydrate', compliancePeriod: '2026' })}</script>`

    expect(() => runOnboardingStep(document, globalThis.location)).not.toThrow()
  })

  test('handles smallProducer radio detached from any container', () => {
    storage.saveProducer({
      contactEmail: 'wizard@example.com',
      batteryTypes: {
        isPortable: false,
        isIndustrial: true,
        isAutomotive: false
      }
    })
    document.body.innerHTML = `
      <form>
        <input name="producerRoute" value="smallProducer" type="radio" />
      </form>
      <script id="page-payload" type="application/json">${JSON.stringify({ step: 'producerRoute', target: 'hydrate', compliancePeriod: '2026' })}</script>
    `

    expect(() => runOnboardingStep(document, globalThis.location)).not.toThrow()
  })

  test('does not flip directRegistrant if it is already checked', () => {
    storage.saveProducer({
      contactEmail: 'wizard@example.com',
      batteryTypes: {
        isPortable: false,
        isIndustrial: true,
        isAutomotive: false
      }
    })
    document.body.innerHTML = `
      <div data-testid="forced-direct" hidden></div>
      <form>
        <div class="govuk-radios__item">
          <input name="producerRoute" value="smallProducer" type="radio" />
        </div>
        <div class="govuk-radios__item">
          <input name="producerRoute" value="directRegistrant" type="radio" checked />
        </div>
      </form>
      <script id="page-payload" type="application/json">${JSON.stringify({ step: 'producerRoute', target: 'hydrate', compliancePeriod: '2026' })}</script>
    `
    runOnboardingStep(document, globalThis.location)
    expect(
      document.querySelector('input[value="directRegistrant"]').checked
    ).toBe(true)
  })

  test('handles a portable-only producer with no forced-direct notice element', () => {
    storage.saveProducer({
      contactEmail: 'wizard@example.com',
      batteryTypes: {
        isPortable: true,
        isIndustrial: false,
        isAutomotive: false
      }
    })
    document.body.innerHTML = `
      <form>
        <div class="govuk-radios__item">
          <input name="producerRoute" value="smallProducer" type="radio" />
        </div>
      </form>
      <script id="page-payload" type="application/json">${JSON.stringify({ step: 'producerRoute', target: 'hydrate', compliancePeriod: '2026' })}</script>
    `
    expect(() => runOnboardingStep(document, globalThis.location)).not.toThrow()
  })
})

describe('runOnboardingStep — producer route gate', () => {
  const renderRoutePage = () => {
    document.body.innerHTML = `
      <div data-testid="forced-direct" hidden></div>
      <form>
        <div class="govuk-radios__item">
          <input name="producerRoute" value="smallProducer" type="radio" />
        </div>
        <div class="govuk-radios__item">
          <input name="producerRoute" value="directRegistrant" type="radio" />
        </div>
      </form>
      <script id="page-payload" type="application/json">${JSON.stringify({ step: 'producerRoute', target: 'hydrate', compliancePeriod: '2026' })}</script>
    `
  }

  test('hides the smallProducer option and shows the forced notice when industrial is set', () => {
    storage.saveProducer({
      contactEmail: 'wizard@example.com',
      batteryTypes: {
        isPortable: false,
        isIndustrial: true,
        isAutomotive: false
      }
    })
    renderRoutePage()
    runOnboardingStep(document, globalThis.location)

    const small = document
      .querySelector('input[value="smallProducer"]')
      .closest('.govuk-radios__item')
    expect(small.hidden).toBe(true)
    expect(document.querySelector('[data-testid="forced-direct"]').hidden).toBe(
      false
    )
    expect(
      document.querySelector('input[value="directRegistrant"]').checked
    ).toBe(true)
  })

  test('keeps the smallProducer option visible for portable-only producers', () => {
    storage.saveProducer({
      contactEmail: 'wizard@example.com',
      batteryTypes: {
        isPortable: true,
        isIndustrial: false,
        isAutomotive: false
      }
    })
    renderRoutePage()
    runOnboardingStep(document, globalThis.location)

    const small = document
      .querySelector('input[value="smallProducer"]')
      .closest('.govuk-radios__item')
    expect(small.hidden).toBe(false)
    expect(document.querySelector('[data-testid="forced-direct"]').hidden).toBe(
      true
    )
  })
})
