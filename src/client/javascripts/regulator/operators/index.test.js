// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runRegulatorOperatorsPage } from './index.js'
import { storage } from '../../storage-adapter.js'

const pageHtml = (payload) => `
  <table><tbody data-testid="operators-body"></tbody></table>
  <p data-testid="operators-empty" hidden></p>
  <p data-testid="operator-detail-not-found" hidden></p>
  <dl data-testid="operator-detail-list">
    <dd data-testid="operator-detail-name"></dd>
    <dd data-testid="operator-detail-type"></dd>
    <dd data-testid="operator-detail-company-reg"></dd>
    <dd data-testid="operator-detail-address"></dd>
    <dd data-testid="operator-detail-sites"></dd>
    <dd data-testid="operator-detail-status"></dd>
    <dd data-testid="operator-detail-agency"></dd>
    <dd data-testid="operator-detail-approval-number"></dd>
  </dl>
  <div data-testid="operator-detail-actions" hidden></div>
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

describe('runRegulatorOperatorsPage', () => {
  test('redirects to sign-in when no agency selected', () => {
    document.body.innerHTML = pageHtml({ view: 'list' })
    const result = runRegulatorOperatorsPage(document, { assign: assignSpy })
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
        typeLabels: { abto: 'ABTO', abe: 'ABE' },
        viewAction: 'View'
      },
      urls: { detailTemplate: '/regulator/operators/{operatorId}', dashboard: '/regulator' }
    })
    const result = runRegulatorOperatorsPage(document, { assign: assignSpy })
    expect(result).toBe('rendered')
  })

  test('dispatches to detail view', () => {
    storage.seedDemoData()
    storage.setCurrentAgencyCode('EA')
    const operator = storage.listOperators()[0]
    document.body.innerHTML = pageHtml({
      view: 'detail',
      target: 'hydrate',
      operatorId: operator.id
    })
    const result = runRegulatorOperatorsPage(document, { assign: assignSpy })
    expect(result).toBe('hydrated')
  })

  test('dispatches to withdraw view', () => {
    storage.seedDemoData()
    storage.setCurrentAgencyCode('EA')
    const approved = storage.listOperators().find((o) => o.approvalStatus === 'approved')
    document.body.innerHTML = `
      <p data-testid="operator-withdraw-name" hidden></p>
      <script id="page-payload" type="application/json">${JSON.stringify({
        view: 'withdraw',
        target: 'hydrate',
        operatorId: approved.id
      })}</script>
    `
    const result = runRegulatorOperatorsPage(document, { assign: assignSpy })
    expect(result).toBe('hydrated')
  })
})
