// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runRegulatorProducerList } from './index.js'
import { storage } from '../../../storage-adapter.js'

const listHtml = (payload) => `
  <table><tbody data-testid="producers-body"></tbody></table>
  <p data-testid="producers-empty" hidden>No producers found.</p>
  <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
`

const defaultPayload = {
  view: 'list',
  compliancePeriodYear: '2026',
  copy: {
    viewAction: 'View'
  },
  urls: {
    detailTemplate: '/regulator/producers/{producerId}',
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

describe('runRegulatorProducerList', () => {
  test('renders producer rows when producers exist', () => {
    document.body.innerHTML = listHtml(defaultPayload)
    const result = runRegulatorProducerList(document, { assign: assignSpy })
    expect(result).toBe('rendered')
    const rows = document.querySelectorAll('[data-testid="producer-row"]')
    expect(rows.length).toBeGreaterThan(0)
    const empty = document.querySelector('[data-testid="producers-empty"]')
    expect(empty.hidden).toBe(true)
  })

  test('shows empty message when no producers exist', () => {
    storage.resetAllData()
    storage.setCurrentAgencyCode('EA')
    document.body.innerHTML = listHtml(defaultPayload)
    const result = runRegulatorProducerList(document, { assign: assignSpy })
    expect(result).toBe('rendered-empty')
    const empty = document.querySelector('[data-testid="producers-empty"]')
    expect(empty.hidden).toBe(false)
  })

  test('renders view links with correct hrefs', () => {
    document.body.innerHTML = listHtml(defaultPayload)
    runRegulatorProducerList(document, { assign: assignSpy })
    const viewLinks = document.querySelectorAll(
      '[data-testid="producer-row-view"]'
    )
    expect(viewLinks.length).toBeGreaterThan(0)
    for (const link of viewLinks) {
      expect(link.getAttribute('href')).toContain('/regulator/producers/')
    }
  })

  test('renders battery types as comma-separated list', () => {
    document.body.innerHTML = listHtml(defaultPayload)
    runRegulatorProducerList(document, { assign: assignSpy })
    const typeCells = document.querySelectorAll(
      '[data-testid="producer-row-battery-types"]'
    )
    expect(typeCells.length).toBeGreaterThan(0)
  })
})
