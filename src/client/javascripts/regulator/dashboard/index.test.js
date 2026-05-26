// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { initRegulatorDashboard } from './index.js'
import { storage } from '../../storage-adapter.js'

const dashboardHtml = (payload) => `
  <span data-testid="app-heading-title"></span>
  <span data-testid="tile-schemes-count"></span>
  <span data-testid="tile-schemes-action"></span>
  <span data-testid="tile-operators-count"></span>
  <span data-testid="tile-operators-action"></span>
  <span data-testid="tile-producers-count"></span>
  <span data-testid="tile-producers-action"></span>
  <span data-testid="tile-evidence-count"></span>
  <span data-testid="tile-evidence-action"></span>
  <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
`

const defaultPayload = {
  signInUrl: '/regulator/sign-in',
  compliancePeriodYear: '2026',
  copy: {
    schemes: { heading: 'Compliance schemes', countLabel: 'Total schemes', manageAction: 'View schemes', viewAction: 'View all schemes' },
    operators: { heading: 'Operators', countLabel: 'Total operators', manageAction: 'View operators', viewAction: 'View all operators' },
    producers: { heading: 'Producers', countLabel: 'Total producers', manageAction: 'View producers' },
    evidence: { heading: 'Evidence', countLabel: 'Total evidence notes', manageAction: 'View evidence' }
  },
  urls: {
    schemes: '/regulator/schemes',
    operators: '/regulator/operators',
    producers: '/regulator/producers',
    evidence: '/regulator/evidence'
  }
}

let assignSpy

beforeEach(() => {
  globalThis.localStorage.clear()
  assignSpy = vi.fn()
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('initRegulatorDashboard', () => {
  test('redirects to sign-in when no agency is selected', () => {
    document.body.innerHTML = dashboardHtml(defaultPayload)
    expect(initRegulatorDashboard(document, { assign: assignSpy })).toBe(
      'redirected-to-sign-in'
    )
    expect(assignSpy).toHaveBeenCalledWith('/regulator/sign-in')
  })

  test('renders counts and agency name when agency is set', () => {
    storage.seedDemoData()
    storage.setCurrentAgencyCode('EA')
    document.body.innerHTML = dashboardHtml(defaultPayload)

    expect(initRegulatorDashboard(document, { assign: assignSpy })).toBe(
      'rendered'
    )
    expect(assignSpy).not.toHaveBeenCalled()

    const title = document.querySelector('[data-testid="app-heading-title"]')
    expect(title.textContent).toBe('Environment Agency')

    const schemesCount = document.querySelector('[data-testid="tile-schemes-count"]')
    expect(schemesCount.textContent).toContain('Total schemes')

    const producersCount = document.querySelector('[data-testid="tile-producers-count"]')
    expect(producersCount.textContent).toContain('Total producers')
  })
})
