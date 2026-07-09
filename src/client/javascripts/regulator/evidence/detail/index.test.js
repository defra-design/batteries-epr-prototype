// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runRegulatorEvidenceDetail } from './index.js'
import { storage } from '../../../storage-adapter.js'

const detailHtml = (payload) => `
  <p data-testid="evidence-detail-not-found" hidden>Not found.</p>
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
  storage.seedDemoData()
  storage.setCurrentAgencyCode('EA')
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('runRegulatorEvidenceDetail', () => {
  test('hydrates evidence fields when evidence exists', () => {
    const scheme = storage.listSchemes()[0]
    const saved = storage.saveEvidence({
      schemeId: scheme?.id,
      compliancePeriodYear: '2026',
      recipientName: 'Detail Test Recipient',
      tonnes: '5.000',
      category: 'portable',
      status: 'awaiting-acceptance',
      direction: 'operator-to-scheme',
      issuedByOperatorId: null,
      wasteReceivedFrom: '2026-01-01',
      wasteReceivedTo: '2026-03-31'
    })
    document.body.innerHTML = detailHtml({
      view: 'detail',
      target: 'hydrate',
      evidenceId: saved.id
    })
    const result = runRegulatorEvidenceDetail(document, { assign: assignSpy })
    expect(result).toBe('hydrated')
    expect(
      document.querySelector('[data-testid="evidence-detail-tonnes"]')
        .textContent
    ).toBe('5.000')
  })

  test('shows not-found when evidence does not exist', () => {
    document.body.innerHTML = detailHtml({
      view: 'detail',
      target: 'hydrate',
      evidenceId: 'nonexistent-id'
    })
    const result = runRegulatorEvidenceDetail(document, { assign: assignSpy })
    expect(result).toBe('not-found')
    expect(
      document.querySelector('[data-testid="evidence-detail-not-found"]').hidden
    ).toBe(false)
  })
})
