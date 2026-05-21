// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { renderSchemeRepresented } from './index.js'
import { storage } from '../../storage-adapter.js'

const LABELS = { rosterPending: 'Awaiting first roster' }

const buildDom = (registrationId = 'reg-1') => {
  document.body.innerHTML = `
    <h1 data-testid="scheme-represented-heading"></h1>
    <p data-testid="scheme-represented-intro"></p>
    <dd data-testid="scheme-represented-scheme-name">—</dd>
    <dd data-testid="scheme-represented-period">—</dd>
    <dd data-testid="scheme-represented-roster">Awaiting first roster</dd>
    <script id="page-payload" type="application/json">${JSON.stringify({
      registrationId,
      compliancePeriod: '2026',
      labels: LABELS
    })}</script>
  `
}

beforeEach(() => {
  globalThis.localStorage.clear()
  Object.defineProperty(globalThis, 'location', {
    value: { assign: vi.fn() },
    writable: true,
    configurable: true
  })
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('renderSchemeRepresented', () => {
  test('redirects to sign-in when not authenticated', () => {
    buildDom()
    expect(renderSchemeRepresented(document)).toBe(false)
  })

  test('renders scheme name and compliance period for a complete registration', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    const scheme = storage.saveScheme({
      name: 'Northern Battery Compliance Scheme',
      lastRosterAt: '2026-03-15T00:00:00Z'
    })
    const registration = storage.saveRegistration({
      compliancePeriod: '2026',
      schemeId: scheme.id
    })

    buildDom(registration.id)
    expect(renderSchemeRepresented(document)).toBe('rendered')
    expect(
      document.querySelector('[data-testid="scheme-represented-scheme-name"]').textContent
    ).toBe('Northern Battery Compliance Scheme')
    expect(
      document.querySelector('[data-testid="scheme-represented-period"]').textContent
    ).toBe('2026')
    expect(
      document.querySelector('[data-testid="scheme-represented-roster"]').textContent
    ).toContain('Mar')
  })

  test('shows the awaiting-roster label when scheme has no roster date', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    const scheme = storage.saveScheme({ name: 'Bare Scheme' })
    const registration = storage.saveRegistration({
      compliancePeriod: '2026',
      schemeId: scheme.id
    })

    buildDom(registration.id)
    renderSchemeRepresented(document)
    expect(
      document.querySelector('[data-testid="scheme-represented-roster"]').textContent
    ).toBe('Awaiting first roster')
  })

  test('handles a missing registration without crashing', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    buildDom('no-such-registration')
    expect(renderSchemeRepresented(document)).toBe('rendered')
    expect(
      document.querySelector('[data-testid="scheme-represented-scheme-name"]').textContent
    ).toBe('—')
    expect(
      document.querySelector('[data-testid="scheme-represented-period"]').textContent
    ).toBe('2026')
  })

  test('handles a registration without a schemeId', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    const registration = storage.saveRegistration({ compliancePeriod: '2026' })
    buildDom(registration.id)
    renderSchemeRepresented(document)
    expect(
      document.querySelector('[data-testid="scheme-represented-scheme-name"]').textContent
    ).toBe('—')
  })
})
