// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runRegulatorEvidenceList } from './index.js'
import { storage } from '../../../storage-adapter.js'

const listHtml = (payload) => `
  <table><tbody data-testid="evidence-body"></tbody></table>
  <p data-testid="evidence-empty" hidden>No evidence notes found.</p>
  <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
`

const defaultPayload = {
  view: 'list',
  compliancePeriodYear: '2026',
  copy: {
    categories: { portable: 'Portable', industrial: 'Industrial', automotive: 'Automotive' },
    statuses: { 'awaiting-acceptance': 'Awaiting acceptance', accepted: 'Accepted', cancelled: 'Cancelled', 'awaiting-authorisation': 'Awaiting authorisation' },
    viewAction: 'View'
  },
  urls: {
    detailTemplate: '/regulator/evidence/{evidenceId}',
    dashboard: '/regulator'
  }
}

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

describe('runRegulatorEvidenceList', () => {
  test('shows empty message when no evidence exists', () => {
    storage.resetAllData()
    storage.setCurrentAgencyCode('EA')
    document.body.innerHTML = listHtml(defaultPayload)
    const result = runRegulatorEvidenceList(document, { assign: assignSpy })
    expect(result).toBe('rendered-empty')
    const empty = document.querySelector('[data-testid="evidence-empty"]')
    expect(empty.hidden).toBe(false)
  })

  test('renders evidence rows when evidence exists', () => {
    const scheme = storage.listSchemes()[0]
    if (!scheme) return
    storage.saveEvidence({
      schemeId: scheme.id,
      compliancePeriodYear: '2026',
      recipientName: 'Test Recipient',
      tonnes: '1.500',
      category: 'portable',
      status: 'awaiting-acceptance',
      direction: 'operator-to-scheme',
      issuedByOperatorId: null
    })
    document.body.innerHTML = listHtml(defaultPayload)
    const result = runRegulatorEvidenceList(document, { assign: assignSpy })
    expect(result).toBe('rendered')
    const rows = document.querySelectorAll('[data-testid="evidence-row"]')
    expect(rows.length).toBeGreaterThan(0)
    const empty = document.querySelector('[data-testid="evidence-empty"]')
    expect(empty.hidden).toBe(true)
  })

  test('renders view links with correct hrefs', () => {
    storage.saveEvidence({
      schemeId: storage.listSchemes()[0]?.id,
      compliancePeriodYear: '2026',
      recipientName: 'Link Test',
      tonnes: '2.000',
      category: 'industrial',
      status: 'accepted'
    })
    document.body.innerHTML = listHtml(defaultPayload)
    runRegulatorEvidenceList(document, { assign: assignSpy })
    const viewLinks = document.querySelectorAll('[data-testid="evidence-row-view"]')
    expect(viewLinks.length).toBeGreaterThan(0)
    for (const link of viewLinks) {
      expect(link.getAttribute('href')).toContain('/regulator/evidence/')
    }
  })

  test('resolves operator name for operator-to-scheme evidence', () => {
    const operator = storage.listOperators()[0]
    const scheme = storage.listSchemes()[0]
    if (!operator || !scheme) return
    storage.saveEvidence({
      schemeId: scheme.id,
      compliancePeriodYear: '2026',
      recipientName: scheme.name,
      tonnes: '3.000',
      category: 'portable',
      status: 'awaiting-acceptance',
      direction: 'operator-to-scheme',
      issuedByOperatorId: operator.id
    })
    document.body.innerHTML = listHtml(defaultPayload)
    runRegulatorEvidenceList(document, { assign: assignSpy })
    const issuerCells = document.querySelectorAll('[data-testid="evidence-row-issuer"]')
    const hasOperatorName = [...issuerCells].some((cell) => cell.textContent.includes(operator.name))
    expect(hasOperatorName).toBe(true)
  })
})
