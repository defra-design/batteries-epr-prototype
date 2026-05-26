// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runRegulatorSchemesPage } from './index.js'
import { storage } from '../../storage-adapter.js'

const pageHtml = (payload) => `
  <table><tbody data-testid="schemes-body"></tbody></table>
  <p data-testid="schemes-empty" hidden></p>
  <p data-testid="scheme-detail-not-found" hidden></p>
  <dl data-testid="scheme-detail-list">
    <dd data-testid="scheme-detail-name"></dd>
    <dd data-testid="scheme-detail-operator"></dd>
    <dd data-testid="scheme-detail-address"></dd>
    <dd data-testid="scheme-detail-contact-address"></dd>
    <dd data-testid="scheme-detail-operational-plan"></dd>
    <dd data-testid="scheme-detail-partners"></dd>
    <dd data-testid="scheme-detail-offences"></dd>
    <dd data-testid="scheme-detail-status"></dd>
    <dd data-testid="scheme-detail-agency"></dd>
    <dd data-testid="scheme-detail-approval-number"></dd>
  </dl>
  <div data-testid="scheme-detail-actions" hidden></div>
  <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
`

let assignSpy

beforeEach(() => {
  globalThis.localStorage.clear()
  assignSpy = vi.fn()
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('runRegulatorSchemesPage', () => {
  test('redirects to sign-in when no agency selected', () => {
    document.body.innerHTML = pageHtml({ view: 'list' })
    const result = runRegulatorSchemesPage(document, { assign: assignSpy })
    expect(result).toBe('redirected-to-sign-in')
    expect(assignSpy).toHaveBeenCalledWith('/regulator/sign-in')
  })

  test('dispatches to list view', () => {
    storage.seedDemoData()
    storage.setCurrentAgencyCode('EA')
    document.body.innerHTML = pageHtml({
      view: 'list',
      compliancePeriodYear: '2026',
      copy: {
        statuses: { approved: 'Approved', submitted: 'Submitted' },
        viewAction: 'View'
      },
      urls: { detailTemplate: '/regulator/schemes/{schemeId}', dashboard: '/regulator' }
    })
    const result = runRegulatorSchemesPage(document, { assign: assignSpy })
    expect(result).toBe('rendered')
  })

  test('dispatches to detail view', () => {
    storage.seedDemoData()
    storage.setCurrentAgencyCode('EA')
    const scheme = storage.listSchemes()[0]
    document.body.innerHTML = pageHtml({
      view: 'detail',
      target: 'hydrate',
      schemeId: scheme.id
    })
    const result = runRegulatorSchemesPage(document, { assign: assignSpy })
    expect(result).toBe('hydrated')
  })

  test('dispatches to withdraw view', () => {
    storage.seedDemoData()
    storage.setCurrentAgencyCode('EA')
    const approved = storage.listSchemes().find((s) => s.approvalStatus === 'approved')
    document.body.innerHTML = `
      <p data-testid="scheme-withdraw-name" hidden></p>
      <script id="page-payload" type="application/json">${JSON.stringify({
        view: 'withdraw',
        target: 'hydrate',
        schemeId: approved.id
      })}</script>
    `
    const result = runRegulatorSchemesPage(document, { assign: assignSpy })
    expect(result).toBe('hydrated')
  })
})
