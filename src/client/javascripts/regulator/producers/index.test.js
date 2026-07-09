// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runRegulatorProducersPage } from './index.js'
import { storage } from '../../storage-adapter.js'

const pageHtml = (payload) => `
  <table><tbody data-testid="producers-body"></tbody></table>
  <p data-testid="producers-empty" hidden></p>
  <p data-testid="producer-detail-not-found" hidden></p>
  <dl data-testid="producer-detail-list">
    <dd data-testid="producer-detail-bprn"></dd>
    <dd data-testid="producer-detail-company-name"></dd>
    <dd data-testid="producer-detail-trading-name"></dd>
    <dd data-testid="producer-detail-company-reg"></dd>
    <dd data-testid="producer-detail-address"></dd>
    <dd data-testid="producer-detail-contact"></dd>
    <dd data-testid="producer-detail-battery-types"></dd>
    <dd data-testid="producer-detail-agency"></dd>
    <dd data-testid="producer-detail-status"></dd>
  </dl>
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

describe('runRegulatorProducersPage', () => {
  test('redirects to sign-in when no agency selected', () => {
    document.body.innerHTML = pageHtml({ view: 'list' })
    const result = runRegulatorProducersPage(document, { assign: assignSpy })
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
        viewAction: 'View'
      },
      urls: {
        detailTemplate: '/regulator/producers/{producerId}',
        dashboard: '/regulator'
      }
    })
    const result = runRegulatorProducersPage(document, { assign: assignSpy })
    expect(result).toBe('rendered')
  })

  test('dispatches to detail view', () => {
    storage.seedDemoData()
    storage.setCurrentAgencyCode('EA')
    const producer = storage.listAllProducers()[0]
    document.body.innerHTML = pageHtml({
      view: 'detail',
      target: 'hydrate',
      producerId: producer.id
    })
    const result = runRegulatorProducersPage(document, { assign: assignSpy })
    expect(result).toBe('hydrated')
  })
})
