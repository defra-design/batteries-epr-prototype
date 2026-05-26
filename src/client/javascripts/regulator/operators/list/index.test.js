// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runRegulatorOperatorList } from './index.js'
import { storage } from '../../../storage-adapter.js'

const listHtml = (payload) => `
  <table><tbody data-testid="operators-body"></tbody></table>
  <p data-testid="operators-empty" hidden>No operators found.</p>
  <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
`

const defaultPayload = {
  view: 'list',
  compliancePeriodYear: '2026',
  copy: {
    statuses: { 'not-started': 'Not started', 'in-progress': 'In progress', submitted: 'Submitted', approved: 'Approved', rejected: 'Rejected' },
    typeLabels: { abto: 'ABTO', abe: 'ABE' },
    viewAction: 'View'
  },
  urls: {
    detailTemplate: '/regulator/operators/{operatorId}',
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

describe('runRegulatorOperatorList', () => {
  test('renders operator rows when operators exist', () => {
    document.body.innerHTML = listHtml(defaultPayload)
    const result = runRegulatorOperatorList(document, { assign: assignSpy })
    expect(result).toBe('rendered')
    const rows = document.querySelectorAll('[data-testid="operator-row"]')
    expect(rows.length).toBeGreaterThan(0)
    const empty = document.querySelector('[data-testid="operators-empty"]')
    expect(empty.hidden).toBe(true)
  })

  test('shows empty message when no operators exist', () => {
    storage.resetAllData()
    storage.setCurrentAgencyCode('EA')
    document.body.innerHTML = listHtml(defaultPayload)
    const result = runRegulatorOperatorList(document, { assign: assignSpy })
    expect(result).toBe('rendered-empty')
    const empty = document.querySelector('[data-testid="operators-empty"]')
    expect(empty.hidden).toBe(false)
  })

  test('renders type labels correctly', () => {
    document.body.innerHTML = listHtml(defaultPayload)
    runRegulatorOperatorList(document, { assign: assignSpy })
    const typeCells = document.querySelectorAll('[data-testid="operator-row-type"]')
    expect(typeCells.length).toBeGreaterThan(0)
    const hasAbto = [...typeCells].some((cell) => cell.textContent.includes('ABTO'))
    expect(hasAbto).toBe(true)
  })

  test('renders view links with correct hrefs', () => {
    document.body.innerHTML = listHtml(defaultPayload)
    runRegulatorOperatorList(document, { assign: assignSpy })
    const viewLinks = document.querySelectorAll('[data-testid="operator-row-view"]')
    expect(viewLinks.length).toBeGreaterThan(0)
    for (const link of viewLinks) {
      expect(link.getAttribute('href')).toContain('/regulator/operators/')
    }
  })
})
