// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { initCategories } from './index.js'
import { storage } from '../../../storage-adapter.js'

const PAYLOAD = {
  step: 'iaCategories',
  target: 'hydrate',
  compliancePeriod: '2026',
  registrationId: 'reg-1',
  signInUrl: '/sign-in',
  dashboardUrl: '/dashboard'
}

const buildDom = (payload = PAYLOAD) => {
  document.body.innerHTML = `
    <div id="ia-categories-loading" data-testid="ia-categories-loading"></div>
    <div id="ia-categories-content" data-testid="ia-categories-content" hidden>
      <ul data-testid="ia-categories-list"></ul>
      <p id="ia-categories-no-categories" data-testid="ia-categories-no-categories" hidden></p>
      <a id="ia-categories-start" data-testid="ia-categories-start" href="/annual-return/reg-1/ia/tonnages">Start</a>
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

describe('initCategories', () => {
  test('redirects to sign-in when not authenticated', () => {
    buildDom()
    expect(initCategories(document, globalThis.location)).toBe(false)
    expect(assignSpy).toHaveBeenCalledWith('/sign-in')
  })

  test('redirects to dashboard when no producer record exists', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    buildDom()
    expect(initCategories(document, globalThis.location)).toBe(
      'redirected-to-dashboard'
    )
    expect(assignSpy).toHaveBeenCalledWith('/dashboard')
  })

  test('lists declared categories for an industrial+automotive producer', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' },
      batteryTypes: { isIndustrial: true, isAutomotive: true }
    })
    buildDom()

    expect(initCategories(document, globalThis.location)).toBe('rendered')
    const items = document.querySelectorAll('[data-testid="ia-category-item"]')
    expect(items).toHaveLength(2)
    expect(items[0].textContent).toContain('Industrial')
    expect(items[1].textContent).toContain('Automotive')
  })

  test('hides the Start button when no I/A categories declared', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' },
      batteryTypes: { isPortable: true }
    })
    buildDom()

    expect(initCategories(document, globalThis.location)).toBe('rendered')
    expect(
      document.querySelector('[data-testid="ia-categories-no-categories"]')
        .hidden
    ).toBe(false)
    expect(
      document.querySelector('[data-testid="ia-categories-start"]').hidden
    ).toBe(true)
  })

  test('renders category labels via textContent (no HTML injection risk)', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' },
      batteryTypes: { isIndustrial: true }
    })
    buildDom()
    initCategories(document, globalThis.location)
    const items = document.querySelectorAll('[data-testid="ia-category-item"]')
    expect(items[0].textContent).toBe('Industrial batteries')
  })

  test('runs without the list / start / loading nodes silently', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' },
      batteryTypes: { isPortable: true }
    })
    document.body.innerHTML = `<script id="page-payload" type="application/json">${JSON.stringify(PAYLOAD)}</script>`
    expect(() => initCategories(document, globalThis.location)).not.toThrow()
  })

  test('falls back to defaults when payload is missing', () => {
    document.body.innerHTML = `
      <div id="ia-categories-loading"></div>
      <div id="ia-categories-content" hidden></div>
    `
    expect(initCategories(document, globalThis.location)).toBe(false)
    expect(assignSpy).toHaveBeenCalledWith('/sign-in')
  })

  test('falls back to /dashboard when payload omits dashboardUrl', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    const payload = { ...PAYLOAD }
    delete payload.dashboardUrl
    buildDom(payload)
    expect(initCategories(document, globalThis.location)).toBe(
      'redirected-to-dashboard'
    )
    expect(assignSpy).toHaveBeenCalledWith('/dashboard')
  })

  test('handles a producer with no batteryTypes object', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    globalThis.localStorage.setItem(
      'npwd-batteries:producers',
      JSON.stringify({
        'a@b.com': { contactEmail: 'a@b.com', companyName: 'Acme' }
      })
    )
    buildDom()
    expect(initCategories(document, globalThis.location)).toBe('rendered')
    expect(
      document.querySelector('[data-testid="ia-categories-no-categories"]')
        .hidden
    ).toBe(false)
  })
})
