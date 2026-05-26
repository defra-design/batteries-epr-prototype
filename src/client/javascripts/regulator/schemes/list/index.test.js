// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runRegulatorSchemeList } from './index.js'
import { storage } from '../../../storage-adapter.js'

const listHtml = (payload) => `
  <table><tbody data-testid="schemes-body"></tbody></table>
  <p data-testid="schemes-empty" hidden>No schemes found.</p>
  <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
`

const defaultPayload = {
  view: 'list',
  compliancePeriodYear: '2026',
  copy: {
    statuses: { 'not-started': 'Not started', 'in-progress': 'In progress', submitted: 'Submitted', approved: 'Approved', rejected: 'Rejected' },
    viewAction: 'View'
  },
  urls: {
    detailTemplate: '/regulator/schemes/{schemeId}',
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

describe('runRegulatorSchemeList', () => {
  test('renders scheme rows when schemes exist', () => {
    document.body.innerHTML = listHtml(defaultPayload)
    const result = runRegulatorSchemeList(document, { assign: assignSpy })
    expect(result).toBe('rendered')
    const rows = document.querySelectorAll('[data-testid="scheme-row"]')
    expect(rows.length).toBeGreaterThan(0)
    const empty = document.querySelector('[data-testid="schemes-empty"]')
    expect(empty.hidden).toBe(true)
  })

  test('shows empty message when no schemes exist', () => {
    storage.resetAllData()
    storage.setCurrentAgencyCode('EA')
    document.body.innerHTML = listHtml(defaultPayload)
    const result = runRegulatorSchemeList(document, { assign: assignSpy })
    expect(result).toBe('rendered-empty')
    const empty = document.querySelector('[data-testid="schemes-empty"]')
    expect(empty.hidden).toBe(false)
  })

  test('renders status tags with correct classes', () => {
    document.body.innerHTML = listHtml(defaultPayload)
    runRegulatorSchemeList(document, { assign: assignSpy })
    const statusCells = document.querySelectorAll('[data-testid="scheme-row-status"]')
    expect(statusCells.length).toBeGreaterThan(0)
    const hasTag = [...statusCells].some((cell) => cell.querySelector('.govuk-tag'))
    expect(hasTag).toBe(true)
  })

  test('renders view links with correct hrefs', () => {
    document.body.innerHTML = listHtml(defaultPayload)
    runRegulatorSchemeList(document, { assign: assignSpy })
    const viewLinks = document.querySelectorAll('[data-testid="scheme-row-view"]')
    expect(viewLinks.length).toBeGreaterThan(0)
    for (const link of viewLinks) {
      expect(link.getAttribute('href')).toContain('/regulator/schemes/')
    }
  })
}
)
