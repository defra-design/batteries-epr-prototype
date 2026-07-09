// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runRegulatorEvidencePage } from './index.js'
import { storage } from '../../storage-adapter.js'

const pageHtml = (payload) => `
  <table><tbody data-testid="evidence-body"></tbody></table>
  <p data-testid="evidence-empty" hidden></p>
  <p data-testid="evidence-detail-not-found" hidden></p>
  <dl data-testid="evidence-detail-list">
    <dd data-testid="evidence-detail-issuer"></dd>
    <dd data-testid="evidence-detail-recipient"></dd>
    <dd data-testid="evidence-detail-category"></dd>
    <dd data-testid="evidence-detail-tonnes"></dd>
    <dd data-testid="evidence-detail-status"></dd>
    <dd data-testid="evidence-detail-issued"></dd>
    <dd data-testid="evidence-detail-dates"></dd>
    <dd data-testid="evidence-detail-direction"></dd>
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

describe('runRegulatorEvidencePage', () => {
  test('redirects to sign-in when no agency selected', () => {
    document.body.innerHTML = pageHtml({ view: 'list' })
    const result = runRegulatorEvidencePage(document, { assign: assignSpy })
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
        categories: {
          portable: 'Portable',
          industrial: 'Industrial',
          automotive: 'Automotive'
        },
        statuses: {
          'awaiting-acceptance': 'Awaiting acceptance',
          accepted: 'Accepted'
        },
        viewAction: 'View'
      },
      urls: {
        detailTemplate: '/regulator/evidence/{evidenceId}',
        dashboard: '/regulator'
      }
    })
    const result = runRegulatorEvidencePage(document, { assign: assignSpy })
    expect(result === 'rendered' || result === 'rendered-empty').toBe(true)
  })

  test('dispatches to detail view with existing evidence', () => {
    storage.seedDemoData()
    storage.setCurrentAgencyCode('EA')
    const allEvidence = storage.listAllEvidence()
    if (allEvidence.length === 0) return
    const evidence = allEvidence[0]
    document.body.innerHTML = pageHtml({
      view: 'detail',
      target: 'hydrate',
      evidenceId: evidence.id
    })
    const result = runRegulatorEvidencePage(document, { assign: assignSpy })
    expect(result).toBe('hydrated')
  })

  test('dispatches to detail view with nonexistent evidence', () => {
    storage.seedDemoData()
    storage.setCurrentAgencyCode('EA')
    document.body.innerHTML = pageHtml({
      view: 'detail',
      target: 'hydrate',
      evidenceId: 'nonexistent-id'
    })
    const result = runRegulatorEvidencePage(document, { assign: assignSpy })
    expect(result).toBe('not-found')
  })
})
