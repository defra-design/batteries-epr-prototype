// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runRegulatorAuditTrail } from './index.js'
import { storage } from '../../storage-adapter.js'

const copy = {
  empty: 'No changes yet.',
  notSet: 'Not set',
  fieldLabels: { collection: 'collection', recycling: 'recycling' },
  categoryLabels: {
    portable: 'portable',
    industrial: 'industrial',
    automotive: 'automotive'
  }
}

const buildDom = () => {
  document.body.innerHTML = `
    <p data-testid="audit-trail-agency" hidden></p>
    <table><tbody data-testid="audit-trail-list"></tbody></table>
    <p data-testid="audit-trail-empty" hidden></p>
    <script id="page-payload" type="application/json">${JSON.stringify({ view: 'auditTrail', copy })}</script>
  `
}

beforeEach(() => {
  globalThis.localStorage.clear()
  storage.seedDemoData()
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('runRegulatorAuditTrail', () => {
  test('redirects to sign-in when no agency is selected', () => {
    const assign = vi.fn()
    buildDom()
    expect(runRegulatorAuditTrail(document, { assign })).toBe(
      'redirected-to-sign-in'
    )
    expect(assign).toHaveBeenCalledWith('/regulator/sign-in')
  })

  test('renders the seeded entries as table rows scoped to the current agency', () => {
    storage.setCurrentAgencyCode('EA')
    buildDom()
    expect(runRegulatorAuditTrail(document)).toBe('rendered')

    const label = document.querySelector('[data-testid="audit-trail-agency"]')
    expect(label.hidden).toBe(false)
    expect(label.textContent).toBe('Environment Agency')

    const rows = document.querySelectorAll('[data-testid="audit-entry"]')
    expect(rows.length).toBe(3)
    expect(rows[0].textContent).toContain('(EA)')
    expect(
      document.querySelector('[data-testid="audit-trail-empty"]').hidden
    ).toBe(true)
  })

  test('reveals the empty message for an agency with no changes', () => {
    storage.setCurrentAgencyCode('SEPA')
    buildDom()
    expect(runRegulatorAuditTrail(document)).toBe('rendered-empty')
    expect(
      document.querySelector('[data-testid="audit-trail-empty"]').hidden
    ).toBe(false)
    expect(
      document.querySelectorAll('[data-testid="audit-entry"]').length
    ).toBe(0)
  })
})
